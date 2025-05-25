import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
        '^infrastructure/(.*)$': path.join(__dirname, 'src/infrastructure/$1'),
        '^core/(.*)$': path.join(__dirname, 'src/core/$1'),
        '^domain/(.*)$': path.join(__dirname, 'src/domain/$1'),
        '^config/(.*)$': path.join(__dirname, 'src/config/$1'),
    },
    moduleDirectories: ['node_modules', 'src'],
    verbose: true,
};