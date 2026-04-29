import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'fd5b12134c1d488b8d89e52b7df4bf4a'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'c041f3062953490b8d31defaf42b0976'
                    }
                }
            }
        }
    }
}
