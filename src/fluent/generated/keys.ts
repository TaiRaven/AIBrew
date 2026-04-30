import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    aibrew_home: {
                        table: 'sys_ui_page'
                        id: '437e9bae7316435cb7de2a11eddd20d3'
                    }
                    aibrew_home_module: {
                        table: 'sys_app_module'
                        id: '90a09a7aa79b4d2c832e80e0cd8eb4f3'
                    }
                    aibrew_menu: {
                        table: 'sys_app_application'
                        id: 'b20c83341ef84c09af92bad6b70da64d'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'fd5b12134c1d488b8d89e52b7df4bf4a'
                    }
                    equipment_create: {
                        table: 'sys_security_acl'
                        id: 'e1989d90731d4507a55643167ca5ceaa'
                    }
                    equipment_delete: {
                        table: 'sys_security_acl'
                        id: '6677b45c53b5444686bfc535233177e3'
                    }
                    equipment_read: {
                        table: 'sys_security_acl'
                        id: '72ee539bb69b4e58af923b658d390169'
                    }
                    equipment_write: {
                        table: 'sys_security_acl'
                        id: '2e598eb57bad400ead7147ee1544fb06'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'c041f3062953490b8d31defaf42b0976'
                    }
                    roaster_create: {
                        table: 'sys_security_acl'
                        id: '7d26237f9ce04c12879442072835f106'
                    }
                    roaster_delete: {
                        table: 'sys_security_acl'
                        id: '401161658f9e41f4a4f44048efa86ec7'
                    }
                    roaster_read: {
                        table: 'sys_security_acl'
                        id: '1dbf626a47fe4fc5b3dd723e5ed31e8d'
                    }
                    roaster_write: {
                        table: 'sys_security_acl'
                        id: '0a6448c56c4c4a9a9f05f53bae9695ee'
                    }
                }
                composite: [
                    {
                        table: 'sys_dictionary'
                        id: '0c3167991b0942b49b394db5cb99012f'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'active'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '15b50f2b569a4b4e8f6dd9773c986261'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '19386cdddbda431cad93948b2a38feae'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '2287fae8e2474cc3a6307b5058b01729'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2de5f27f247d480f899aec8c9285b4ef'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'type'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '34b987d78aeb4611bd78b3e13ade70ee'
                        key: {
                            sys_security_acl: '72ee539bb69b4e58af923b658d390169'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3779447641dc4ac68571b6ec18426005'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '38a44fb10798488a9b909485ca93158c'
                        key: {
                            sys_security_acl: '7d26237f9ce04c12879442072835f106'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '3cd28a450c6c42ae8025b3979cf23c8d'
                        key: {
                            name: 'x_664529_aibrew_home.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '40af07e90f6c41b79cdbfa5b985691fa'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '437e9bae7316435cb7de2a11eddd20d3'
                        key: {
                            endpoint: 'x_664529_aibrew_home.do'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '46805f8f5fae4750ba02dbf4ecf672e1'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '4c2ff26eb4a64fe38867b8ff6543f3ca'
                        key: {
                            application_file: 'cdbf170c4a514d3d89e5d860cb0d2717'
                            source_artifact: '3cd28a450c6c42ae8025b3979cf23c8d'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '51accf89aad5453bb6200986a6765525'
                        key: {
                            sys_security_acl: '0a6448c56c4c4a9a9f05f53bae9695ee'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '535f9d4ec57548eebde1f22e7f25f5e7'
                        key: {
                            sys_security_acl: '6677b45c53b5444686bfc535233177e3'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '5a5199e78cec49b881271a3f268109fa'
                        key: {
                            sys_security_acl: '401161658f9e41f4a4f44048efa86ec7'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '60e46a54df954373a4a349aed8d9b0ec'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '62abf4c7a9b74a0cb4b20e89b82770e1'
                        key: {
                            sys_security_acl: 'e1989d90731d4507a55643167ca5ceaa'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '69ffd3b10c6b424c81cae51d7d3cea5e'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'website'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7b1c0d94f0124874a51a4845bef5a4c2'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7bc858d36b9c4e0f8868c051f842c342'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '97b6abc6d8c147199d6b8f4d656bd927'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9822f3da72014adb85c026329fc741cb'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '9933d224a95e4c3b8c8b40f18892b4b2'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9aba3b957dca460f8fbc453f1baad931'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a6efcd7fa3254e8aa0232ea0474d3391'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ac855e3f62a5482d9c71b76d5a689fe5'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'type'
                            value: 'grinder'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'aded1ff5f0184a2fb9ca820d08dbb590'
                        key: {
                            name: 'x_664529_aibrew/main'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'b1a38579b92548c7a566ab3dec31e35b'
                        key: {
                            name: 'x_664529_aibrew.user'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'b6ace7c285664a1eafe6c54a2b417c60'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c712742a919046b899fc6e0f088df94d'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'type'
                            value: 'brewer'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c9032ecc02904abbaec46faa076896d0'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cdacf8fc5f864d5897384c0b548bcc52'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'cdbf170c4a514d3d89e5d860cb0d2717'
                        key: {
                            name: 'x_664529_aibrew/main.js.map'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ce74a3384f254e2c83291d5c054a57a8'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'cf19beb3b6c6495aa95026f97741734b'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'cf5d340a660740d1b7ee7a6425be6d4c'
                        key: {
                            application_file: '437e9bae7316435cb7de2a11eddd20d3'
                            source_artifact: '3cd28a450c6c42ae8025b3979cf23c8d'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd0b1898aa26b4b9685869fad7b22f997'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'e3b478bcf3074b14977977a1ca75da32'
                        key: {
                            application_file: 'aded1ff5f0184a2fb9ca820d08dbb590'
                            source_artifact: '3cd28a450c6c42ae8025b3979cf23c8d'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e63c45b65a03459a992eba3a004902ab'
                        key: {
                            sys_security_acl: '1dbf626a47fe4fc5b3dd723e5ed31e8d'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e732ff39187643aabaf646d6c9bf96e8'
                        key: {
                            sys_security_acl: '2e598eb57bad400ead7147ee1544fb06'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fdfadccf558f41218dc1b2ff9944102f'
                        key: {
                            name: 'x_664529_aibrew_roaster'
                            element: 'website'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ff7d17e1a86240d0ad7c08e6f7b7dc60'
                        key: {
                            name: 'x_664529_aibrew_equipment'
                            element: 'name'
                        }
                    },
                ]
            }
        }
    }
}
