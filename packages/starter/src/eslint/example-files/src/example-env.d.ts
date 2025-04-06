declare module 'foobar' {
    interface AllowInterfacesInEnvFiles {
        bar: string;
    }

    const foo: AllowInterfacesInEnvFiles;

    // Should be allowed
    export default foo;
}
