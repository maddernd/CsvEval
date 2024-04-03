"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const csv_stringify_1 = require("csv-stringify");
const math = __importStar(require("mathjs"));
const inputFile = 'input.csv';
const outputFile = 'output.csv';
// Function to asynchronously read and parse the CSV file
const readCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        const data = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parse_1.parse)({ columns: false, trim: true }))
            .on('data', (row) => data.push(row))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(data));
    });
};
// Function to evaluate expressions and generate output CSV
const evaluateAndGenerateCSV = async (data) => {
    const variables = data[0].reduce((acc, value, index) => {
        const letter = String.fromCharCode(65 + index); // Converts 0 => A, 1 => B, etc.
        acc[letter] = parseFloat(value);
        return acc;
    }, {}); // Explicitly cast the initial value as Variables
    const results = data.map((row, rowIndex) => {
        if (rowIndex === 0)
            return row; // Skip the header row
        return row.map(cell => {
            try {
                const evaluated = math.evaluate(cell, variables);
                return isNaN(evaluated) ? cell : evaluated.toString();
            }
            catch (error) {
                const message = error.message; // Type assertion to Error
                console.error(`Error evaluating expression "${cell}":`, message);
                return cell;
            }
        });
    });
    return new Promise((resolve, reject) => {
        (0, csv_stringify_1.stringify)(results, { header: false }, (error, output) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(output);
            }
        });
    });
};
// Main function to orchestrate reading, evaluating, and writing CSV
const main = async () => {
    try {
        const data = await readCSV(inputFile);
        const output = await evaluateAndGenerateCSV(data);
        fs_1.default.writeFileSync(outputFile, output);
        console.log(`Evaluation complete. Check ${outputFile}`);
    }
    catch (error) {
        const message = error.message; // Type assertion to Error
        console.error('An error occurred:', message);
    }
};
main();
