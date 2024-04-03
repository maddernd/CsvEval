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
// Imports used are csv parse for reading csv data, csv stringfy for converting back to csv format and Mathjs for evaluating expressions.
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const csv_stringify_1 = require("csv-stringify");
const math = __importStar(require("mathjs"));
// Set input and output file conts
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
            // Resolve promise with accumlated data
            .on('end', () => resolve(data));
    });
};
// Function to evaluate expressions and generate output CSV
const evaluateAndGenerateCSV = async (data) => {
    // Creating a variables object from the first row
    const variables = data[0].reduce((acc, value, index) => {
        // Converts 0 => A, 1 => B as per task requirements.
        const letter = String.fromCharCode(65 + index);
        // Assigning numeric value to letter key in accumulator object
        acc[letter] = parseFloat(value);
        // Returning the accumulator for the next iteration
        return acc;
        // Explicitly cast the initial value as Variables
    }, {});
    // Mapping over each row of the input data
    const results = data.map((row, rowIndex) => {
        // Skip the header row
        if (rowIndex === 0)
            return row;
        return row.map(cell => {
            try {
                // Evaluating the expression in the cell using the variables object
                const evaluated = math.evaluate(cell, variables);
                return isNaN(evaluated) ? cell : evaluated.toString();
            }
            catch (error) {
                const message = error.message;
                console.error(`Error evaluating expression "${cell}":`, message);
                // Returning the original cell value in case of error
                return cell;
            }
        });
    });
    return new Promise((resolve, reject) => {
        (0, csv_stringify_1.stringify)(results, { header: false }, (error, output) => {
            if (error) {
                // Rejecting promise if error occurs during stringification
                reject(error);
            }
            else {
                // Resolving promise with CSV string output
                resolve(output);
            }
        });
    });
};
// Main function to run reading, evaluating, and writing CSV
const main = async () => {
    try {
        // Reading and parsing the input CSV
        const data = await readCSV(inputFile);
        // Evaluating expressions and generating output CSV data
        const output = await evaluateAndGenerateCSV(data);
        // Writing the output data to a file
        fs_1.default.writeFileSync(outputFile, output);
        console.log(`Evaluation complete. Check ${outputFile}`);
    }
    catch (error) {
        const message = error.message;
        console.error('An error occurred:', message);
    }
};
main();
