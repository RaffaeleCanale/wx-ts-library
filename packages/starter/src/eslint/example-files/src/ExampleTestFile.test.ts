// eslint-disable-next-line func-style
const foo = () => {
    // No-op
};

// Any is allowed in tests
const x = 'foo' as any;

const thisNumberCausesPrecisionLoss = 0.1 + 0.2;
// In tests, this should be allowed
const displayNumber = `My number is ${thisNumberCausesPrecisionLoss}`;

console.log(foo, x, displayNumber);
