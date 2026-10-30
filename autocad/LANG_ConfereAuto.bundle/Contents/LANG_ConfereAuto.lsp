;;; LANG ConfereAuto 0.1.0
;;; Confere e corrige pranchas geradas pelo LANG ProjetoAuto.
;;;
;;; Comandos:
;;;   CONFEREPROJETO   confere o desenho aberto e corrige o que for seguro
;;;   CONFERESOMENTE   so confere, sem alterar nada
;;;   PROJETOSEGURO    roda o PROJETO, mas antes exige que o desenho esteja em DWG
;;;
;;; Uso em lote (Conferir-Projeto.ps1):
;;;   (lang-confere:executar "C:/pasta/parametros.txt" "C:/pasta/relatorio.json")
;;;
;;; O que corrige: camadas das plantas fora do padrao de cor/espessura, cotas que encostam em
;;; textos/blocos e material "A definir" do quadro de esquadrias (quando um material padrao foi informado).
;;; O que so aponta: objetos com espessura diferente do padrao, fossa/sumidouro, campos "A DEFINIR"
;;; de prefeitura, objetos na camada 0, cotas que nao acharam lugar livre.

(vl-load-com)

(setq lang-confere:versao "0.1.0")

;; Padrao do ProjetoAuto 0.5.9 (pa05:plan-layers): (camada cor espessura-em-centesimos-de-mm)
(setq lang-confere:camadas
 '(("LANG-PA-PL-PAREDE" 7 50)
   ("LANG-PA-PL-HACHURA" 8 13)
   ("LANG-PA-PL-ESQ" 4 35)
   ("LANG-PA-PL-PROJECAO" 8 18)
   ("LANG-PA-PL-QUADRO" 8 13)))

(setq lang-confere:camada-cotas "LANG-PA-COTAS")
(setq lang-confere:palavras-fossa '("*FOSSA*" "*SUMIDOURO*" "*TANQUE S?PTICO*" "*FILTRO ANAER?BIO*"))

;;; ------------------------------------------------------------------
;;; Utilidades

(defun lang-confere:doc () (vla-get-ActiveDocument (vlax-get-acad-object)))

(defun lang-confere:abrir (arquivo modo / f)
 ;; AutoCAD 2021+ aceita a codificacao; versoes antigas so os dois argumentos.
 (setq f (vl-catch-all-apply 'open (list arquivo modo "utf8")))
 (if (or (vl-catch-all-error-p f) (null f)) (open arquivo modo) f))

(defun lang-confere:ler-parametros (arquivo / f linha pos lista)
 ;; Arquivo com linhas chave=valor. Chaves usadas: modo (corrigir|conferir), material.
 (if (and arquivo (findfile arquivo) (setq f (lang-confere:abrir arquivo "r")))
  (progn
   (while (setq linha (read-line f))
    (if (setq pos (vl-string-search "=" linha))
     (setq lista (cons (cons (strcase (vl-string-trim " \t\r" (substr linha 1 pos)) t)
                             (vl-string-trim " \t\r" (substr linha (+ pos 2))))
                       lista))))
   (close f)))
 lista)

(defun lang-confere:param (lista chave padrao / v)
 (if (and (setq v (cdr (assoc chave lista))) (/= v "")) v padrao))

(defun lang-confere:json-texto (s / i c r)
 (setq r "" i 1)
 (while (<= i (strlen s))
  (setq c (substr s i 1))
  (setq r (strcat r (cond ((= c "\"") "\\\"")
                          ((= c "\\") "\\\\")
                          ((= c "\n") "\\n")
                          ((= c "\r") "")
                          ((= c "\t") " ")
                          (t c))))
  (setq i (1+ i)))
 (strcat "\"" r "\""))

(defun lang-confere:json (v)
 ;; Listas de pares (("chave" . valor) ...) viram objeto; demais listas viram array.
 (cond ((null v) "null")
       ((= v t) "true")
       ((= v 'falso) "false")
       ((= (type v) 'STR) (lang-confere:json-texto v))
       ((= (type v) 'INT) (itoa v))
       ((= (type v) 'REAL) (rtos v 2 4))
       ((and (listp v) (listp (car v)) (= (type (caar v)) 'STR))
        (strcat "{"
                (lang-confere:juntar (mapcar '(lambda (p) (strcat (lang-confere:json-texto (car p)) ":" (lang-confere:json (cdr p)))) v) ",")
                "}"))
       ((listp v) (strcat "[" (lang-confere:juntar (mapcar 'lang-confere:json v) ",") "]"))
       (t (lang-confere:json-texto (vl-princ-to-string v)))))

(defun lang-confere:juntar (lista sep / r)
 (setq r "")
 (foreach s lista (setq r (if (= r "") s (strcat r sep s))))
 r)

(defun lang-confere:caixa (obj / a b r)
 (setq r (vl-catch-all-apply 'vla-GetBoundingBox (list obj 'a 'b)))
 (if (not (vl-catch-all-error-p r))
  (list (vlax-safearray->list a) (vlax-safearray->list b))))

(defun lang-confere:encosta (c1 c2 folga)
 ;; Caixas alinhadas aos eixos; a folga encolhe a primeira para tolerar toques de borda.
 (and c1 c2
      (< (+ (car (car c1)) folga) (car (cadr c2)))
      (> (- (car (cadr c1)) folga) (car (car c2)))
      (< (+ (cadr (car c1)) folga) (cadr (cadr c2)))
      (> (- (cadr (cadr c1)) folga) (cadr (car c2)))))

(defun lang-confere:item (handle camada texto)
 (list (cons "handle" handle) (cons "camada" camada) (cons "texto" texto)))

(defun lang-confere:texto-de (obj)
 (if (vlax-property-available-p obj 'TextString) (vla-get-TextString obj) ""))

;;; ------------------------------------------------------------------
;;; 1. Camadas e espessuras

(defun lang-confere:camadas-checar (corrigir / camadas lay achados qtd obj spec)
 (setq camadas (vla-get-Layers (lang-confere:doc)))
 (foreach spec lang-confere:camadas
  (if (not (vl-catch-all-error-p (setq lay (vl-catch-all-apply 'vla-Item (list camadas (car spec))))))
   (if (or (/= (vla-get-Color lay) (cadr spec)) (/= (vla-get-Lineweight lay) (caddr spec)))
    (progn
     (setq achados (cons (list (cons "camada" (car spec))
                               (cons "cor" (vla-get-Color lay)) (cons "espessura" (vla-get-Lineweight lay))
                               (cons "cor_padrao" (cadr spec)) (cons "espessura_padrao" (caddr spec))
                               (cons "corrigido" (if corrigir t 'falso)))
                         achados))
     (if corrigir (progn (vla-put-Color lay (cadr spec)) (vla-put-Lineweight lay (caddr spec))))))))
 ;; Objetos com espessura propria diferente do padrao da camada. So aponta: o ProjetoAuto da
 ;; espessura por objeto de proposito (pa05:style-part, conforme o estilo grafico escolhido).
 ;; Quem ja esta com a espessura padrao nao conta.
 (setq qtd 0)
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (if (and (setq spec (assoc (vla-get-Layer obj) lang-confere:camadas))
           (vlax-property-available-p obj 'Lineweight)
           (not (member (vla-get-Lineweight obj) (list acLnWtByLayer (caddr spec)))))
   (setq qtd (1+ qtd))))
 (list (cons "camadas_fora_do_padrao" (reverse achados))
       (cons "objetos_com_espessura_propria" qtd)))

;;; ------------------------------------------------------------------
;;; 2. Cotas encostando em textos, baloes e blocos

(defun lang-confere:obstaculos (/ lista c)
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (if (and (member (vla-get-ObjectName obj) '("AcDbText" "AcDbMText" "AcDbBlockReference" "AcDbCircle"))
           (setq c (lang-confere:caixa obj)))
   (setq lista (cons (list (vla-get-Handle obj) c) lista))))
 lista)

(defun lang-confere:livre (caixa handle obst folga / livre)
 (setq livre t)
 (foreach o obst
  (if (and livre (/= (car o) handle) (lang-confere:encosta caixa (cadr o) folga)) (setq livre nil)))
 livre)

(defun lang-confere:cotas-checar (corrigir / obst movidas presas c h ang folga ok desl ux uy cands d nova obj handle)
 (setq obst (lang-confere:obstaculos))
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (if (and (= (strcase (vla-get-Layer obj)) lang-confere:camada-cotas)
           (member (vla-get-ObjectName obj) '("AcDbText" "AcDbMText"))
           (setq c (lang-confere:caixa obj)))
   (progn
    (setq handle (vla-get-Handle obj)
          h (if (vlax-property-available-p obj 'Height) (vla-get-Height obj) (- (cadr (cadr c)) (cadr (car c))))
          folga (* h 0.05))
    (if (not (lang-confere:livre c handle obst folga))
     (progn
      (setq ang (vla-get-Rotation obj) ok nil
            ;; perpendicular ao texto primeiro (afasta da linha de cota), depois ao longo dele
            ux (- (sin ang)) uy (cos ang)
            cands (list 1.2 -1.2 2.4 -2.4))
      (if corrigir
       (progn
        (foreach d (append (mapcar '(lambda (k) (list (* k ux h) (* k uy h))) cands)
                           (mapcar '(lambda (k) (list (* k (cos ang) h) (* k (sin ang) h))) '(1.5 -1.5 3.0 -3.0)))
         (if (not ok)
          (progn
           (setq nova (list (mapcar '+ (car c) (list (car d) (cadr d) 0.0))
                            (mapcar '+ (cadr c) (list (car d) (cadr d) 0.0))))
           (if (lang-confere:livre nova handle obst folga)
            (progn
             (vla-Move obj (vlax-3d-point 0 0 0) (vlax-3d-point (car d) (cadr d) 0))
             (setq ok t obst (subst (list handle nova) (assoc handle obst) obst)))))))))
      (if ok
       (setq movidas (cons (lang-confere:item handle (vla-get-Layer obj) (lang-confere:texto-de obj)) movidas))
       (setq presas (cons (lang-confere:item handle (vla-get-Layer obj) (lang-confere:texto-de obj)) presas))))))))
 (list (cons "cotas_movidas" (reverse movidas))
       (cons "cotas_com_colisao_sem_solucao" (reverse presas))))

;;; ------------------------------------------------------------------
;;; 3. Quadro de esquadrias: material "A definir"

(defun lang-confere:material-checar (material / cabecalhos trocados pendentes s x y hx hy h col)
 ;; Colunas: a celula "A definir" so e trocada se estiver abaixo de um cabecalho MATERIAL.
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (if (and (member (vla-get-ObjectName obj) '("AcDbText" "AcDbMText"))
           (wcmatch (strcase (lang-confere:texto-de obj)) "MATERIAL,MATERIAIS"))
   (setq cabecalhos (cons (list (vlax-safearray->list (vlax-variant-value (vla-get-InsertionPoint obj)))
                                (vla-get-Height obj))
                          cabecalhos))))
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (if (and (member (vla-get-ObjectName obj) '("AcDbText" "AcDbMText"))
           (wcmatch (strcase (setq s (lang-confere:texto-de obj))) "*A DEFINIR*")
           (wcmatch (strcase (vla-get-Layer obj)) "LANG-PA-PL-QUADRO,LANG-PA-TEXTO"))
   (progn
    (setq x (car (vlax-safearray->list (vlax-variant-value (vla-get-InsertionPoint obj))))
          y (cadr (vlax-safearray->list (vlax-variant-value (vla-get-InsertionPoint obj))))
          col nil)
    (foreach cab cabecalhos
     (setq hx (car (car cab)) hy (cadr (car cab)) h (cadr cab))
     (if (and (< (abs (- x hx)) (* 3 h)) (< y hy) (< (- hy y) (* 60 h))) (setq col t)))
    (cond
     ((wcmatch (strcase s) "*MATERIAL: A DEFINIR*")
      (if material
       (progn (vla-put-TextString obj (lang-confere:trocar s "A definir" material))
              (setq trocados (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) s) trocados)))
       (setq pendentes (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) s) pendentes))))
     ((and col (= (strcase (vl-string-trim " " s)) "A DEFINIR"))
      (if material
       (progn (vla-put-TextString obj material)
              (setq trocados (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) s) trocados)))
       (setq pendentes (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) s) pendentes))))))))
 (list (cons "material_preenchido" (reverse trocados))
       (cons "material_a_definir" (reverse pendentes))))

(defun lang-confere:trocar (s velho novo / pos)
 ;; troca a primeira ocorrencia, sem diferenciar maiusculas
 (if (setq pos (vl-string-search (strcase velho) (strcase s)))
  (setq s (strcat (substr s 1 pos) novo (substr s (+ pos 1 (strlen velho))))))
 s)

;;; ------------------------------------------------------------------
;;; 4. Pontos que dependem do responsavel (so aponta)

(defun lang-confere:pendencias (ignorar / fossa prefeitura camada0 s nome)
 ;; ignorar: handles ja relatados no quadro de esquadrias (nao repete como campo de prefeitura)
 (vlax-for obj (vla-get-ModelSpace (lang-confere:doc))
  (setq s (strcase (lang-confere:texto-de obj))
        nome (if (= (vla-get-ObjectName obj) "AcDbBlockReference") (strcase (vla-get-EffectiveName obj)) ""))
  (if (vl-some '(lambda (p) (or (wcmatch s p) (wcmatch nome p) (wcmatch (strcase (vla-get-Layer obj)) p))) lang-confere:palavras-fossa)
   (setq fossa (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) (if (= s "") nome s)) fossa)))
  (if (and (wcmatch s "*A DEFINIR*")
           (not (wcmatch s "*MATERIAL*"))
           (not (member (vla-get-Handle obj) ignorar))
           (not (wcmatch (strcase (vla-get-Layer obj)) "LANG-PA-PL-QUADRO")))
   (setq prefeitura (cons (lang-confere:item (vla-get-Handle obj) (vla-get-Layer obj) s) prefeitura)))
  (if (= (vla-get-Layer obj) "0")
   (setq camada0 (cons (vla-get-Handle obj) camada0))))
 (list (cons "usa_fossa" (reverse fossa))
       (cons "campos_a_definir" (reverse prefeitura))
       (cons "objetos_na_camada_0" (length camada0))))

;;; ------------------------------------------------------------------
;;; Execucao

(defun lang-confere:salvar-dwg (arquivo)
 ;; acNative: formato DWG da versao instalada, mesmo que o desenho tenha sido aberto de um DXF
 (vla-SaveAs (lang-confere:doc) arquivo acNative)
 arquivo)

(defun lang-confere:rodar (corrigir material / doc nome r esq vistos)
 (setq doc (lang-confere:doc) nome (vla-get-FullName doc))
 (if corrigir (vla-StartUndoMark doc))
 (setq esq (lang-confere:material-checar (if corrigir material)))
 (foreach lista (mapcar 'cdr esq)
  (foreach i lista (setq vistos (cons (cdr (assoc "handle" i)) vistos))))
 (setq r (list (cons "versao" lang-confere:versao)
               (cons "desenho" (if (= nome "") (getvar "DWGNAME") nome))
               (cons "modo" (if corrigir "corrigir" "conferir"))
               (cons "formato_dxf" (if (wcmatch (strcase (getvar "DWGNAME")) "*.DXF") t 'falso))
               (cons "camadas" (lang-confere:camadas-checar corrigir))
               (cons "cotas" (lang-confere:cotas-checar corrigir))
               (cons "esquadrias" esq)
               (cons "pendencias" (lang-confere:pendencias vistos))))
 (if corrigir (vla-EndUndoMark doc))
 r)

(defun lang-confere:gravar (arquivo dados / f)
 (if (setq f (lang-confere:abrir arquivo "w"))
  (progn (write-line (lang-confere:json dados) f) (close f) t)))

(defun lang-confere:executar (parametros relatorio / p r erro)
 (setq p (lang-confere:ler-parametros parametros))
 (setq r (vl-catch-all-apply 'lang-confere:rodar
                             (list (/= (strcase (lang-confere:param p "modo" "corrigir")) "CONFERIR")
                                   (lang-confere:param p "material" nil))))
 (if (vl-catch-all-error-p r)
  (setq r (list (cons "versao" lang-confere:versao) (cons "erro" (vl-catch-all-error-message r)))))
 (lang-confere:gravar relatorio r)
 (princ))

(defun lang-confere:resumo (r / n)
 (defun n (caminho / v)
  (setq v r)
  (foreach k caminho (setq v (cdr (assoc k v))))
  (if (listp v) (length v) v))
 (princ (strcat "\nLANG ConfereAuto " lang-confere:versao
                "\n  Camadas fora do padrao: " (itoa (n '("camadas" "camadas_fora_do_padrao")))
                "\n  Objetos com espessura diferente do padrao (so aponta): " (itoa (n '("camadas" "objetos_com_espessura_propria")))
                "\n  Cotas movidas: " (itoa (n '("cotas" "cotas_movidas")))
                "\n  Cotas com colisao sem solucao: " (itoa (n '("cotas" "cotas_com_colisao_sem_solucao")))
                "\n  Material preenchido: " (itoa (n '("esquadrias" "material_preenchido")))
                "\n  Material ainda a definir: " (itoa (n '("esquadrias" "material_a_definir")))
                "\n  Itens de fossa/sumidouro: " (itoa (n '("pendencias" "usa_fossa")))
                "\n  Campos A DEFINIR (prefeitura etc.): " (itoa (n '("pendencias" "campos_a_definir")))
                "\n  Objetos na camada 0: " (itoa (n '("pendencias" "objetos_na_camada_0")))))
 (princ))

(defun c:CONFEREPROJETO (/ material r)
 (setq material (getstring t "\nMaterial padrao das esquadrias <deixar A definir>: "))
 (setq r (lang-confere:rodar t (if (/= material "") material)))
 (lang-confere:resumo r)
 (princ "\nPara desfazer tudo: U."))

(defun c:CONFERESOMENTE ()
 (lang-confere:resumo (lang-confere:rodar nil nil)))

(defun c:PROJETOSEGURO (/ dwg)
 ;; O PROJETO para em "LAYOUT IMPLANTACAO" quando o croqui esta em DXF. Aqui o DXF vira DWG antes.
 (if (wcmatch (strcase (getvar "DWGNAME")) "*.DXF")
  (progn
   (setq dwg (strcat (getvar "DWGPREFIX") (vl-filename-base (getvar "DWGNAME")) ".dwg"))
   (if (findfile dwg)
    (alert (strcat "Este croqui esta em DXF e o PROJETO nao funciona com DXF.\n\nJa existe " dwg
                   "\nAbra esse DWG (ou use SALVARCOMO) e rode o PROJETO nele."))
    (progn
     (lang-confere:salvar-dwg dwg)
     (alert (strcat "O croqui estava em DXF e foi salvo como DWG:\n" dwg "\n\nO PROJETO vai rodar agora no DWG."))
     (vla-SendCommand (lang-confere:doc) "PROJETO "))))
  (vla-SendCommand (lang-confere:doc) "PROJETO "))
 (princ))

(princ (strcat "\nLANG ConfereAuto " lang-confere:versao " carregado: CONFEREPROJETO, CONFERESOMENTE, PROJETOSEGURO."))
(princ)
