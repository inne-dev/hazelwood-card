package space.inne.hazelwood.auth;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class JsonCodec {
    private JsonCodec() {}

    static Object parse(String json) {
        if (json == null || json.length() > 2_000_000) {
            throw new IllegalArgumentException("Invalid JSON size");
        }
        Parser parser = new Parser(json);
        Object value = parser.value(0);
        parser.space();
        if (parser.position != json.length()) {
            throw new IllegalArgumentException("Trailing JSON data");
        }
        return value;
    }

    static String stringify(Object value) {
        StringBuilder output = new StringBuilder();
        append(output, value);
        return output.toString();
    }

    private static void append(StringBuilder output, Object value) {
        if (value == null) {
            output.append("null");
        } else if (value instanceof String string) {
            quote(output, string);
        } else if (value instanceof Number || value instanceof Boolean) {
            output.append(value);
        } else if (value instanceof Map<?, ?> map) {
            output.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!(entry.getKey() instanceof String key)) {
                    throw new IllegalArgumentException("JSON object keys must be strings");
                }
                if (!first) {
                    output.append(',');
                }
                first = false;
                quote(output, key);
                output.append(':');
                append(output, entry.getValue());
            }
            output.append('}');
        } else if (value instanceof Iterable<?> values) {
            output.append('[');
            boolean first = true;
            for (Object item : values) {
                if (!first) {
                    output.append(',');
                }
                first = false;
                append(output, item);
            }
            output.append(']');
        } else {
            throw new IllegalArgumentException("Unsupported JSON value type");
        }
    }

    private static void quote(StringBuilder output, String value) {
        output.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> output.append("\\\"");
                case '\\' -> output.append("\\\\");
                case '\b' -> output.append("\\b");
                case '\f' -> output.append("\\f");
                case '\n' -> output.append("\\n");
                case '\r' -> output.append("\\r");
                case '\t' -> output.append("\\t");
                default -> {
                    if (c < 0x20) {
                        output.append(String.format("\\u%04x", (int) c));
                    } else {
                        output.append(c);
                    }
                }
            }
        }
        output.append('"');
    }

    private static final class Parser {
        private final String source;
        private int position;

        private Parser(String source) {
            this.source = source;
        }

        private Object value(int depth) {
            if (depth > 32) {
                throw new IllegalArgumentException("JSON nesting is too deep");
            }
            space();
            if (position >= source.length()) {
                throw new IllegalArgumentException("Unexpected end of JSON");
            }
            return switch (source.charAt(position)) {
                case '{' -> object(depth + 1);
                case '[' -> array(depth + 1);
                case '"' -> string();
                case 't' -> literal("true", Boolean.TRUE);
                case 'f' -> literal("false", Boolean.FALSE);
                case 'n' -> literal("null", null);
                default -> number();
            };
        }

        private Map<String, Object> object(int depth) {
            position++;
            Map<String, Object> result = new LinkedHashMap<>();
            space();
            if (take('}')) {
                return result;
            }
            while (true) {
                space();
                if (position >= source.length() || source.charAt(position) != '"') {
                    throw new IllegalArgumentException("Expected JSON object key");
                }
                String key = string();
                space();
                require(':');
                result.put(key, value(depth));
                space();
                if (take('}')) {
                    return result;
                }
                require(',');
            }
        }

        private List<Object> array(int depth) {
            position++;
            List<Object> result = new ArrayList<>();
            space();
            if (take(']')) {
                return result;
            }
            while (true) {
                result.add(value(depth));
                space();
                if (take(']')) {
                    return result;
                }
                require(',');
            }
        }

        private String string() {
            require('"');
            StringBuilder result = new StringBuilder();
            while (position < source.length()) {
                char c = source.charAt(position++);
                if (c == '"') {
                    return result.toString();
                }
                if (c != '\\') {
                    if (c < 0x20) {
                        throw new IllegalArgumentException("Invalid control character in JSON string");
                    }
                    result.append(c);
                    continue;
                }
                if (position >= source.length()) {
                    throw new IllegalArgumentException("Invalid JSON escape");
                }
                char escaped = source.charAt(position++);
                switch (escaped) {
                    case '"', '\\', '/' -> result.append(escaped);
                    case 'b' -> result.append('\b');
                    case 'f' -> result.append('\f');
                    case 'n' -> result.append('\n');
                    case 'r' -> result.append('\r');
                    case 't' -> result.append('\t');
                    case 'u' -> {
                        if (position + 4 > source.length()) {
                            throw new IllegalArgumentException("Invalid unicode escape");
                        }
                        try {
                            result.append((char) Integer.parseInt(source.substring(position, position + 4), 16));
                        } catch (NumberFormatException error) {
                            throw new IllegalArgumentException("Invalid unicode escape", error);
                        }
                        position += 4;
                    }
                    default -> throw new IllegalArgumentException("Invalid JSON escape");
                }
            }
            throw new IllegalArgumentException("Unterminated JSON string");
        }

        private Object number() {
            int start = position;
            if (take('-')) {
                // Sign consumed.
            }
            if (take('0')) {
                if (isDigit(peek())) {
                    throw new IllegalArgumentException("Leading zero in JSON number");
                }
            } else {
                if (position >= source.length() || source.charAt(position) < '1' || source.charAt(position) > '9') {
                    throw new IllegalArgumentException("Invalid JSON number");
                }
                position++;
                while (isDigit(peek())) {
                    position++;
                }
            }
            if (take('.')) {
                digits();
            }
            if (take('e') || take('E')) {
                if (!take('+')) {
                    take('-');
                }
                digits();
            }
            if (start == position) {
                throw new IllegalArgumentException("Invalid JSON value");
            }
            try {
                return Double.parseDouble(source.substring(start, position));
            } catch (NumberFormatException error) {
                throw new IllegalArgumentException("Invalid JSON number", error);
            }
        }

        private void digits() {
            int start = position;
            while (isDigit(peek())) {
                position++;
            }
            if (position == start) {
                throw new IllegalArgumentException("Invalid JSON number");
            }
        }

        private char peek() {
            return position < source.length() ? source.charAt(position) : '\0';
        }

        private static boolean isDigit(char value) {
            return value >= '0' && value <= '9';
        }

        private Object literal(String token, Object value) {
            if (!source.startsWith(token, position)) {
                throw new IllegalArgumentException("Invalid JSON literal");
            }
            position += token.length();
            return value;
        }

        private void space() {
            while (position < source.length() && Character.isWhitespace(source.charAt(position))) {
                position++;
            }
        }

        private boolean take(char expected) {
            if (position < source.length() && source.charAt(position) == expected) {
                position++;
                return true;
            }
            return false;
        }

        private void require(char expected) {
            if (!take(expected)) {
                throw new IllegalArgumentException("Expected '" + expected + "' in JSON");
            }
        }
    }
}
