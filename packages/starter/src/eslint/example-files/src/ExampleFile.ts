/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const castingIsNotAllowed = 'foo' as string;

const thisNumberCausesPrecisionLoss = 0.1 + 0.2;
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
const castNumbersToStringWithoutFormatting = `My number is ${thisNumberCausesPrecisionLoss}`;

// eslint-disable-next-line no-console
console.log('hello');

// eslint-disable-next-line @typescript-eslint/no-restricted-types
function shouldNotReturnNull(): null {
    // eslint-disable-next-line no-restricted-syntax
    return null;
}

// eslint-disable-next-line import/no-default-export
export default function shouldNotAllowDefaultExport() {}
