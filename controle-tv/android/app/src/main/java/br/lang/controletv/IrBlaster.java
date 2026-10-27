package br.lang.controletv;

import android.content.Context;
import android.hardware.ConsumerIrManager;

import java.util.HashMap;
import java.util.Map;

/** Envia os códigos de controle remoto das TVs LG (protocolo NEC, endereço 0x04) pelo infravermelho. */
final class IrBlaster {

    private static final int FREQUENCY_HZ = 38000;
    private static final int LG_ADDRESS = 0x04;
    private static final Map<String, Integer> COMMANDS = new HashMap<>();

    static {
        COMMANDS.put("POWER", 0x08);
        COMMANDS.put("VOLUMEUP", 0x02);
        COMMANDS.put("VOLUMEDOWN", 0x03);
        COMMANDS.put("CHANNELUP", 0x00);
        COMMANDS.put("CHANNELDOWN", 0x01);
        COMMANDS.put("MUTE", 0x09);
        COMMANDS.put("UP", 0x40);
        COMMANDS.put("DOWN", 0x41);
        COMMANDS.put("LEFT", 0x07);
        COMMANDS.put("RIGHT", 0x06);
        COMMANDS.put("ENTER", 0x44);
        COMMANDS.put("BACK", 0x28);
        COMMANDS.put("HOME", 0x7C);
        COMMANDS.put("MENU", 0x43);
        COMMANDS.put("EXIT", 0x5B);
        COMMANDS.put("INPUT", 0x0B);
        COMMANDS.put("INFO", 0xAA);
        COMMANDS.put("PLAY", 0xB0);
        COMMANDS.put("PAUSE", 0xBA);
        for (int i = 0; i <= 9; i++) {
            COMMANDS.put(String.valueOf(i), 0x10 + i);
        }
    }

    private final ConsumerIrManager ir;

    IrBlaster(Context context) {
        ir = (ConsumerIrManager) context.getSystemService(Context.CONSUMER_IR_SERVICE);
    }

    boolean available() {
        return ir != null && ir.hasIrEmitter();
    }

    boolean send(String name) {
        Integer command = COMMANDS.get(name);
        if (command == null || !available()) {
            return false;
        }
        try {
            ir.transmit(FREQUENCY_HZ, nec(LG_ADDRESS, command));
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    /** Pulsos em microssegundos (liga/desliga alternados), bits do menos para o mais significativo. */
    static int[] nec(int address, int command) {
        int[] bytes = {address, ~address & 0xFF, command, ~command & 0xFF};
        int[] pattern = new int[2 + 32 * 2 + 1];
        int i = 0;
        pattern[i++] = 9000;
        pattern[i++] = 4500;
        for (int b : bytes) {
            for (int bit = 0; bit < 8; bit++) {
                pattern[i++] = 560;
                pattern[i++] = ((b >> bit) & 1) == 1 ? 1690 : 560;
            }
        }
        pattern[i] = 560;
        return pattern;
    }
}
