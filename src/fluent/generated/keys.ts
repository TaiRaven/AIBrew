import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    aibrew_home_module: {
                        table: 'sys_app_module'
                        id: '90a09a7aa79b4d2c832e80e0cd8eb4f3'
                    }
                    aibrew_menu: {
                        table: 'sys_app_application'
                        id: 'b20c83341ef84c09af92bad6b70da64d'
                    }
                    bean_create: {
                        table: 'sys_security_acl'
                        id: 'a99012245b92423f884f255c594d3a88'
                    }
                    bean_delete: {
                        table: 'sys_security_acl'
                        id: '3061e7df5f3b4a44b392e58b79bfbc2f'
                    }
                    bean_purchase_create: {
                        table: 'sys_security_acl'
                        id: 'fa5a37f61a3b4d15a2ff3e9937696a92'
                    }
                    bean_purchase_delete: {
                        table: 'sys_security_acl'
                        id: 'b48b29886a9344dc9372558eb593b2f7'
                    }
                    bean_purchase_read: {
                        table: 'sys_security_acl'
                        id: '36478b8b9c934b57b8ce97928d519735'
                    }
                    bean_purchase_write: {
                        table: 'sys_security_acl'
                        id: 'de69f92b79ea43cabfd5722bde5f410b'
                    }
                    bean_read: {
                        table: 'sys_security_acl'
                        id: 'cc05ae58a26f44a1b287999e1db0eab2'
                    }
                    bean_stock_api: {
                        table: 'sys_ws_definition'
                        id: 'ac554a26c0cd4850b93b90980d60b520'
                    }
                    bean_stock_api_v1: {
                        table: 'sys_ws_version'
                        id: '3d0c24045985470f978711177d02fcd2'
                    }
                    bean_stock_get: {
                        table: 'sys_ws_operation'
                        id: 'bcf5c316f43a40de93749d7db7b1104a'
                    }
                    bean_write: {
                        table: 'sys_security_acl'
                        id: '335d5927d2cc4e24b5b662aea5cc2394'
                    }
                    BeanStockHelper: {
                        table: 'sys_script_include'
                        id: '1da4444f8b304ea099f060367b885863'
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
                    'src_server_bean-stock-handler_ts': {
                        table: 'sys_module'
                        id: '7e3606e21a624a9c8a73958f7ebbdbfe'
                    }
                    'src_server_script-includes_BeanStockHelper_server_js': {
                        table: 'sys_module'
                        id: 'c320277f29e143a78ccd942d7766654e'
                    }
                }
                composite: [
                    {
                        table: 'sys_documentation'
                        id: '04675a9ea76144ea99da2a26a2c5d9c0'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '06738dfcaec44a0495da80ee896e03af'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0c2225c43bac47c9b153316365c87ce8'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'name'
                            language: 'en'
                        }
                    },
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
                        id: '13d304c199be446a89ba31baa39f558e'
                        key: {
                            name: 'x_664529_aibrew_bean'
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
                        table: 'sys_choice'
                        id: '1e70a1ec6e314cad8bf6d3da218b3936'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'extra_dark'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1f7b9d82540e4a5e855da4e8ab041715'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'active'
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
                        table: 'sys_security_acl_role'
                        id: '26ad8edee40b4aa19651fa7b4a436678'
                        key: {
                            sys_security_acl: 'de69f92b79ea43cabfd5722bde5f410b'
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
                        table: 'sys_choice'
                        id: '36c37993a4a248f5879c3b6cc7dee99f'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'medium'
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
                        table: 'sys_documentation'
                        id: '3aa388b79ce6451c8c8b25bd5e0dc0ea'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'origin'
                            language: 'en'
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
                        table: 'sys_dictionary'
                        id: '4318ef6234f046b8a2fd07cdd3560177'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_date'
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
                        table: 'sys_security_acl_role'
                        id: '48a3d90c5a0f4ff6968e832f5c333dea'
                        key: {
                            sys_security_acl: 'fa5a37f61a3b4d15a2ff3e9937696a92'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
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
                        table: 'sys_documentation'
                        id: '524ac77098894bbfa92fef92e080100f'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'purchase_date'
                            language: 'en'
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
                        table: 'sys_dictionary'
                        id: '64e4a96249bf4e44ab86209a5b2abc60'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '66ee3c582feb4df6b24599de64a89f90'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'medium_light'
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
                        id: '6b3afbbcb68e45769041b4decb0b90d5'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '74e8d2bd71fa49f08189d0eebe6e41a0'
                        key: {
                            sys_security_acl: '335d5927d2cc4e24b5b662aea5cc2394'
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
                        id: '7609fef4fdb142b8b04ce880844950e4'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'grams'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '76df04cbba6d44ee90e69a889d01ec7c'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'origin'
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
                        table: 'sys_dictionary'
                        id: '7b241cc524344eabbb9c52e92abaa9e2'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roaster'
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
                        table: 'sys_security_acl_role'
                        id: '8947ca4ea7114a949db8c92cf35aac32'
                        key: {
                            sys_security_acl: '36478b8b9c934b57b8ce97928d519735'
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
                        id: '8bbc6b95c4774825b5b7a0b93a3b2622'
                        key: {
                            sys_security_acl: 'a99012245b92423f884f255c594d3a88'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '97754c8cda624646a9a9996ace49418c'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'medium_dark'
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
                        table: 'sys_dictionary'
                        id: '9918f03c6fd94606a11c5e78e2515433'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
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
                        table: 'sys_security_acl_role'
                        id: '9ad3c4b9b028444483e0a1a53fca0cfb'
                        key: {
                            sys_security_acl: 'cc05ae58a26f44a1b287999e1db0eab2'
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
                        id: '9f5b3bc870134a2d96d04a9f46536ad9'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a5c481024863442a82844188a7ae5034'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'bean'
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
                        table: 'sys_security_acl_role'
                        id: 'a74f7cf6f0cc49199fc87e7c8b010867'
                        key: {
                            sys_security_acl: '3061e7df5f3b4a44b392e58b79bfbc2f'
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
                        id: 'aa9cd0cfca8b43b88b3e69f4a2f70847'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'bean'
                            language: 'en'
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
                        table: 'sys_security_acl_role'
                        id: 'ad2154e443914d7c9e557a4ae387d760'
                        key: {
                            sys_security_acl: 'b48b29886a9344dc9372558eb593b2f7'
                            sys_user_role: {
                                id: 'b1a38579b92548c7a566ab3dec31e35b'
                                key: {
                                    name: 'x_664529_aibrew.user'
                                }
                            }
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
                        table: 'sys_dictionary'
                        id: 'b2e055f78bf0477884717e92a447219f'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b4dcd8aa1cbe4cb78d0e01d2e3b55eb9'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roaster'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b4e09d13a6cf479180871f02c93ae22c'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
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
                        table: 'sys_documentation'
                        id: 'b9cd65c7d5e84a31adff9b38ed4e472e'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'baf0a0e91f5b41b599494fc3012df14c'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c0487cded629471188d5b325f7963c81'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'dark'
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
                        id: 'cae56a92c3204f1392f0d64875129847'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_date'
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
                        table: 'sys_db_object'
                        id: 'd2f5159dc6f14296b4bdea9ef2cae498'
                        key: {
                            name: 'x_664529_aibrew_bean'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd7e0a437289144a18e52d8cfb8145bca'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd9e716b9fda6471783d1b5a4919bb451'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'grams'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'e2a78da33adc4537b0ceb6cf25f12f85'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
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
                        id: 'ea709fddae1b4ff2ad80f23c33e1c871'
                        key: {
                            name: 'x_664529_aibrew_bean_purchase'
                            element: 'purchase_date'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ef1bfcfa174f4c75be52c42e443bc4eb'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f206295b38cf4f59a2ed7e45cfe414c2'
                        key: {
                            name: 'x_664529_aibrew_bean'
                            element: 'roast_level'
                            value: 'light'
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
