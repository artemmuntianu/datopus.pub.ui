export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            onboarding_progress: {
                Row: {
                    org_id: number;
                    signup_completed_at: string | null;
                    setup_analytics_completed_at: string | null;
                    setup_bigquery_completed_at: string | null;
                    link_bigquery_completed_at: string | null;
                    connect_analytics_completed_at: string | null;
                    connect_bigquery_completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    org_id: number;
                    signup_completed_at?: string | null;
                    setup_analytics_completed_at?: string | null;
                    setup_bigquery_completed_at?: string | null;
                    link_bigquery_completed_at?: string | null;
                    connect_analytics_completed_at?: string | null;
                    connect_bigquery_completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    org_id?: number;
                    signup_completed_at?: string | null;
                    setup_analytics_completed_at?: string | null;
                    setup_bigquery_completed_at?: string | null;
                    link_bigquery_completed_at?: string | null;
                    connect_analytics_completed_at?: string | null;
                    connect_bigquery_completed_at?: string | null;
                    created_at?: string;
                };
            },
            auth_token: {
                Row: {
                    access_token: string
                    created_at: string
                    expires_on: string
                    id: number
                    refresh_token: string
                    updated_at: string | null
                }
                Insert: {
                    access_token: string
                    created_at?: string
                    expires_on: string
                    id?: number
                    refresh_token: string
                    updated_at?: string | null
                }
                Update: {
                    access_token?: string
                    created_at?: string
                    expires_on?: string
                    id?: number
                    refresh_token?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            big_query_datasource: {
                Row: {
                    auth_step: string | null
                    auth_token_id: number | null
                    created_at: string
                    dataset_id: string | null
                    deactivated_at: string | null
                    id: number
                    is_active: boolean | null
                    org_id: number | null
                    project_id: string | null
                    unique_id: string | null
                }
                Insert: {
                    auth_step?: string | null
                    auth_token_id?: number | null
                    created_at?: string
                    dataset_id?: string | null
                    deactivated_at?: string | null
                    id?: number
                    is_active?: boolean | null
                    org_id?: number | null
                    project_id?: string | null
                    unique_id?: string | null
                }
                Update: {
                    auth_step?: string | null
                    auth_token_id?: number | null
                    created_at?: string
                    dataset_id?: string | null
                    deactivated_at?: string | null
                    id?: number
                    is_active?: boolean | null
                    org_id?: number | null
                    project_id?: string | null
                    unique_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "big_query_datasource_auth_token_id_fkey"
                        columns: ["auth_token_id"]
                        isOneToOne: false
                        referencedRelation: "auth_token"
                        referencedColumns: ["id"]
                    },
                ]
            }
            big_query_dimension: {
                Row: {
                    api_name: string
                    created_at: string
                    custom: boolean
                    description: string | null
                    id: number
                    ui_name: string
                }
                Insert: {
                    api_name: string
                    created_at?: string
                    custom?: boolean
                    description?: string | null
                    id?: number
                    ui_name: string
                }
                Update: {
                    api_name?: string
                    created_at?: string
                    custom?: boolean
                    description?: string | null
                    id?: number
                    ui_name?: string
                }
                Relationships: []
            }
            big_query_metric: {
                Row: {
                    api_name: string
                    created_at: string
                    custom: boolean
                    description: string | null
                    id: number
                    ui_name: string
                }
                Insert: {
                    api_name: string
                    created_at?: string
                    custom: boolean
                    description?: string | null
                    id?: number
                    ui_name: string
                }
                Update: {
                    api_name?: string
                    created_at?: string
                    custom?: boolean
                    description?: string | null
                    id?: number
                    ui_name?: string
                }
                Relationships: []
            }
            dashboard: {
                Row: {
                    author_id: string | null
                    created_at: string
                    description: string | null
                    id: number
                    name: string
                    org_id: number
                    updated_at: string
                }
                Insert: {
                    author_id?: string | null
                    created_at?: string
                    description?: string | null
                    id?: number
                    name: string
                    org_id: number
                    updated_at?: string
                }
                Update: {
                    author_id?: string | null
                    created_at?: string
                    description?: string | null
                    id?: number
                    name?: string
                    org_id?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "dashboard_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            dashboard_tile: {
                Row: {
                    background_color: string | null
                    dashboard_id: number
                    description: string | null
                    height: number
                    id: number
                    name: string
                    width: number
                    x: number
                    y: number
                }
                Insert: {
                    background_color?: string | null
                    dashboard_id: number
                    description?: string | null
                    height: number
                    id?: number
                    name?: string
                    width: number
                    x: number
                    y: number
                }
                Update: {
                    background_color?: string | null
                    dashboard_id?: number
                    description?: string | null
                    height?: number
                    id?: number
                    name?: string
                    width?: number
                    x?: number
                    y?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "dashboard_tiles_dashboard_id_fkey"
                        columns: ["dashboard_id"]
                        isOneToOne: false
                        referencedRelation: "dashboard"
                        referencedColumns: ["id"]
                    },
                ]
            }
            dashboard_tile_content: {
                Row: {
                    created_at: string
                    dashboard_tile_id: number
                    definition_id: number
                    id: number
                    source_type: string
                }
                Insert: {
                    created_at?: string
                    dashboard_tile_id: number
                    definition_id: number
                    id?: number
                    source_type: string
                }
                Update: {
                    created_at?: string
                    dashboard_tile_id?: number
                    definition_id?: number
                    id?: number
                    source_type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "dashboard_tile_content_dashboard_tile_id_fkey"
                        columns: ["dashboard_tile_id"]
                        isOneToOne: false
                        referencedRelation: "dashboard_tile"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "dashboard_tile_content_definition_id_fkey"
                        columns: ["definition_id"]
                        isOneToOne: false
                        referencedRelation: "visual_definition"
                        referencedColumns: ["id"]
                    },
                ]
            }
            datasource: {
                Row: {
                    auth_step: string | null
                    auth_token_id: number | null
                    created_at: string
                    ga_measurement_id: string | null
                    ga_property_id: string | null
                    id: number
                    org_id: number | null
                    unique_id: string | null
                }
                Insert: {
                    auth_step?: string | null
                    auth_token_id?: number | null
                    created_at?: string
                    ga_measurement_id?: string | null
                    ga_property_id?: string | null
                    id?: number
                    org_id?: number | null
                    unique_id?: string | null
                }
                Update: {
                    auth_step?: string | null
                    auth_token_id?: number | null
                    created_at?: string
                    ga_measurement_id?: string | null
                    ga_property_id?: string | null
                    id?: number
                    org_id?: number | null
                    unique_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "datasource_auth_token_id_fkey"
                        columns: ["auth_token_id"]
                        isOneToOne: false
                        referencedRelation: "auth_token"
                        referencedColumns: ["id"]
                    },
                ]
            }
            dimension: {
                Row: {
                    col_name: string
                    created_at: string
                    ga_name: string
                    id: number
                    org_id: number
                    ui_name: string
                    updated_at: string | null
                }
                Insert: {
                    col_name: string
                    created_at?: string
                    ga_name: string
                    id?: number
                    org_id: number
                    ui_name: string
                    updated_at?: string | null
                }
                Update: {
                    col_name?: string
                    created_at?: string
                    ga_name?: string
                    id?: number
                    org_id?: number
                    ui_name?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "dimension_organization_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            dimension_value: {
                Row: {
                    created_at: string
                    dimension_id: number
                    id: number
                    value: string
                }
                Insert: {
                    created_at?: string
                    dimension_id: number
                    id?: number
                    value: string
                }
                Update: {
                    created_at?: string
                    dimension_id?: number
                    id?: number
                    value?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "dimension_value_dimension_id_fkey"
                        columns: ["dimension_id"]
                        isOneToOne: false
                        referencedRelation: "dimension"
                        referencedColumns: ["id"]
                    },
                ]
            }
            external_report: {
                Row: {
                    created_at: string
                    icon: string | null
                    id: number
                    is_published: boolean
                    org_id: number
                    partner_org_id: number | null
                    title: string
                    updated_at: string | null
                    url: string
                }
                Insert: {
                    created_at?: string
                    icon?: string | null
                    id?: number
                    is_published: boolean
                    org_id: number
                    partner_org_id?: number | null
                    title: string
                    updated_at?: string | null
                    url: string
                }
                Update: {
                    created_at?: string
                    icon?: string | null
                    id?: number
                    is_published?: boolean
                    org_id?: number
                    partner_org_id?: number | null
                    title?: string
                    updated_at?: string | null
                    url?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "external_report_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "external_report_partner_org_id_fkey"
                        columns: ["partner_org_id"]
                        isOneToOne: false
                        referencedRelation: "partner_org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            landing_page_users: {
                Row: {
                    affiliate_requested: string | null
                    email: string
                    is_messaged: boolean | null
                    startup_requested: string | null
                }
                Insert: {
                    affiliate_requested?: string | null
                    email: string
                    is_messaged?: boolean | null
                    startup_requested?: string | null
                }
                Update: {
                    affiliate_requested?: string | null
                    email?: string
                    is_messaged?: boolean | null
                    startup_requested?: string | null
                }
                Relationships: []
            }
            monitor: {
                Row: {
                    created_at: string
                    filter: Json[] | null
                    id: number
                    metric: string
                    name: string
                    org_id: number | null
                    threshold_is_percent: boolean
                    threshold_val: number
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string
                    filter?: Json[] | null
                    id?: number
                    metric: string
                    name: string
                    org_id?: number | null
                    threshold_is_percent: boolean
                    threshold_val: number
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string
                    filter?: Json[] | null
                    id?: number
                    metric?: string
                    name?: string
                    org_id?: number | null
                    threshold_is_percent?: boolean
                    threshold_val?: number
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "monitor_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            monitor_insight: {
                Row: {
                    created_at: string
                    date: string
                    id: number
                    is_percent: boolean
                    monitor_id: number
                    stats: number[] | null
                    stats_dates: string[] | null
                    text: string
                    val: number
                }
                Insert: {
                    created_at?: string
                    date: string
                    id?: number
                    is_percent: boolean
                    monitor_id: number
                    stats?: number[] | null
                    stats_dates?: string[] | null
                    text: string
                    val: number
                }
                Update: {
                    created_at?: string
                    date?: string
                    id?: number
                    is_percent?: boolean
                    monitor_id?: number
                    stats?: number[] | null
                    stats_dates?: string[] | null
                    text?: string
                    val?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "monitor_insights_monitor_id_fkey"
                        columns: ["monitor_id"]
                        isOneToOne: false
                        referencedRelation: "monitor"
                        referencedColumns: ["id"]
                    },
                ]
            }
            mtu_stats: {
                Row: {
                    datasource_id: number
                    error_code: string | null
                    error_message: string | null
                    id: number
                    mtu_collected_at: string
                    mtu_collected_count: number | null
                    mtu_collected_for: string
                    org_id: number
                }
                Insert: {
                    datasource_id: number
                    error_code?: string | null
                    error_message?: string | null
                    id?: number
                    mtu_collected_at: string
                    mtu_collected_count?: number | null
                    mtu_collected_for: string
                    org_id: number
                }
                Update: {
                    datasource_id?: number
                    error_code?: string | null
                    error_message?: string | null
                    id?: number
                    mtu_collected_at?: string
                    mtu_collected_count?: number | null
                    mtu_collected_for?: string
                    org_id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "mtu_collection_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "mtu_stats_datasource_id_fkey"
                        columns: ["datasource_id"]
                        isOneToOne: false
                        referencedRelation: "big_query_datasource"
                        referencedColumns: ["id"]
                    },
                ]
            }
            mtu_table_error_log: {
                Row: {
                    datasource_id: number | null
                    error_message: string | null
                    error_time: string | null
                    mtu_collected_for: string | null
                    org_id: number | null
                }
                Insert: {
                    datasource_id?: number | null
                    error_message?: string | null
                    error_time?: string | null
                    mtu_collected_for?: string | null
                    org_id?: number | null
                }
                Update: {
                    datasource_id?: number | null
                    error_message?: string | null
                    error_time?: string | null
                    mtu_collected_for?: string | null
                    org_id?: number | null
                }
                Relationships: []
            }
            org: {
                Row: {
                    big_query_datasource_id: number | null
                    created_at: string
                    datasource_id: number | null
                    id: number
                    name: string
                    subscription: string | null
                    type: string
                    updated_at: string | null
                }
                Insert: {
                    big_query_datasource_id?: number | null
                    created_at?: string
                    datasource_id?: number | null
                    id?: number
                    name: string
                    subscription?: string | null
                    type: string
                    updated_at?: string | null
                }
                Update: {
                    big_query_datasource_id?: number | null
                    created_at?: string
                    datasource_id?: number | null
                    id?: number
                    name?: string
                    subscription?: string | null
                    type?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "org_big_query_datasource_id_fkey"
                        columns: ["big_query_datasource_id"]
                        isOneToOne: false
                        referencedRelation: "big_query_datasource"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "org_datasource_id_fkey"
                        columns: ["datasource_id"]
                        isOneToOne: false
                        referencedRelation: "datasource"
                        referencedColumns: ["id"]
                    },
                ]
            }
            partner_org: {
                Row: {
                    created_at: string
                    datasource_id: number
                    id: number
                    name: string
                    org_id: number
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string
                    datasource_id: number
                    id?: number
                    name: string
                    org_id: number
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string
                    datasource_id?: number
                    id?: number
                    name?: string
                    org_id?: number
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "partner_org_datasource_id_fkey"
                        columns: ["datasource_id"]
                        isOneToOne: false
                        referencedRelation: "datasource"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "partnering_organization_organization_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            stats: {
                Row: {
                    actions: number
                    created_at: string
                    datasource_id: number
                    date: string
                    dim1: string | null
                    dim10: string | null
                    dim2: string | null
                    dim3: string | null
                    dim4: string | null
                    dim5: string | null
                    dim6: string | null
                    dim7: string | null
                    dim8: string | null
                    dim9: string | null
                    feature: string
                    id: number
                    sessions: number
                    source_feature: string
                    users: number
                }
                Insert: {
                    actions: number
                    created_at?: string
                    datasource_id: number
                    date: string
                    dim1?: string | null
                    dim10?: string | null
                    dim2?: string | null
                    dim3?: string | null
                    dim4?: string | null
                    dim5?: string | null
                    dim6?: string | null
                    dim7?: string | null
                    dim8?: string | null
                    dim9?: string | null
                    feature: string
                    id?: number
                    sessions: number
                    source_feature: string
                    users: number
                }
                Update: {
                    actions?: number
                    created_at?: string
                    datasource_id?: number
                    date?: string
                    dim1?: string | null
                    dim10?: string | null
                    dim2?: string | null
                    dim3?: string | null
                    dim4?: string | null
                    dim5?: string | null
                    dim6?: string | null
                    dim7?: string | null
                    dim8?: string | null
                    dim9?: string | null
                    feature?: string
                    id?: number
                    sessions?: number
                    source_feature?: string
                    users?: number
                }
                Relationships: []
            }
            subscription: {
                Row: {
                    cancel_at_period_end: boolean | null
                    canceled_at: string | null
                    created_at: string
                    currency: string | null
                    current_period_end: string | null
                    current_period_start: string | null
                    end_date: string | null
                    id: number
                    lookup_key: string | null
                    mtu_limit_exceeded: boolean
                    org_id: number
                    plan_updated_at: string
                    price_id: string | null
                    product_id: string | null
                    quantity: number | null
                    start_date: string
                    status: string | null
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    trial_ended: string | null
                    trial_started: string | null
                    updated_at: string | null
                }
                Insert: {
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created_at?: string
                    currency?: string | null
                    current_period_end?: string | null
                    current_period_start?: string | null
                    end_date?: string | null
                    id?: number
                    lookup_key?: string | null
                    mtu_limit_exceeded?: boolean
                    org_id: number
                    plan_updated_at?: string
                    price_id?: string | null
                    product_id?: string | null
                    quantity?: number | null
                    start_date: string
                    status?: string | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    trial_ended?: string | null
                    trial_started?: string | null
                    updated_at?: string | null
                }
                Update: {
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created_at?: string
                    currency?: string | null
                    current_period_end?: string | null
                    current_period_start?: string | null
                    end_date?: string | null
                    id?: number
                    lookup_key?: string | null
                    mtu_limit_exceeded?: boolean
                    org_id?: number
                    plan_updated_at?: string
                    price_id?: string | null
                    product_id?: string | null
                    quantity?: number | null
                    start_date?: string
                    status?: string | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    trial_ended?: string | null
                    trial_started?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "subscription_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: true
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
            visual_definition: {
                Row: {
                    created_at: string
                    explanation: string | null
                    id: number
                    org_id: number | null
                    settings: Json | null
                    system_name: string | null
                }
                Insert: {
                    created_at?: string
                    explanation?: string | null
                    id?: number
                    org_id?: number | null
                    settings?: Json | null
                    system_name?: string | null
                }
                Update: {
                    created_at?: string
                    explanation?: string | null
                    id?: number
                    org_id?: number | null
                    settings?: Json | null
                    system_name?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "visual_definition_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "org"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            add_report_tile_transaction: {
                Args: {
                    dashboard_id: number
                    tile_name: string
                    tile_description: string
                    tile_height: number
                    tile_width: number
                    report_settings: Json
                }
                Returns: {
                    dashboard_tile_id: number
                    visual_definition_id: number
                }[]
            }
            add_system_dashboard: {
                Args: {
                    dashboard: Database["public"]["Tables"]["dashboard"]["Row"]
                    report_system_names: string[]
                    dashboard_tiles_config: Json
                }
                Returns: undefined
            }
            check_mtu_limits: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            check_trial_expiration_activity: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            delete_big_query_datasource_safe: {
                Args: { p_id: number }
                Returns: undefined
            }
            finalize_datasource: {
                Args: { p_id: number }
                Returns: undefined
            }
            find_next_position: {
                Args: {
                    p_dashboard_id: number
                    p_grid_width: number
                    p_new_item_width: number
                }
                Returns: {
                    next_x: number
                    next_y: number
                }[]
            }
            get_active_bq_datasources_with_missing_dates: {
                Args: Record<PropertyKey, never>
                Returns: {
                    bqd_id: number
                    bqd_org_id: number
                    bqd_project_id: string
                    bqd_dataset_id: string
                    bqd_auth_token_id: number
                    bqd_created_at: string
                    at_access_token: string
                    at_refresh_token: string
                    at_expires_on: string
                    missing_mtu_dates: string[]
                }[]
            }
            get_datasource_subscription_context: {
                Args: Record<PropertyKey, never>
                Returns: {
                    bqd_id: number
                    bqd_org_id: number
                    bqd_project_id: string
                    bqd_dataset_id: string
                    bqd_auth_token_id: number
                    bqd_created_at: string
                    bqd_is_active: boolean
                    bqd_deactivated_at: string
                    at_access_token: string
                    at_refresh_token: string
                    at_expires_on: string
                    s_start_date: string
                    s_plan_updated_at: string
                }[]
            }
            get_missing_mtu_dates: {
                Args: {
                    target_org_id: number
                    target_datasource_id: number
                    datasource_created_at: string
                }
                Returns: string[]
            }
            get_org_id_for_user: {
                Args: Record<PropertyKey, never>
                Returns: number
            }
            get_subscription_checked: {
                Args: { in_org_id: number }
                Returns: {
                    cancel_at_period_end: boolean | null
                    canceled_at: string | null
                    created_at: string
                    currency: string | null
                    current_period_end: string | null
                    current_period_start: string | null
                    end_date: string | null
                    id: number
                    lookup_key: string | null
                    mtu_limit_exceeded: boolean
                    org_id: number
                    plan_updated_at: string
                    price_id: string | null
                    product_id: string | null
                    quantity: number | null
                    start_date: string
                    status: string | null
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    trial_ended: string | null
                    trial_started: string | null
                    updated_at: string | null
                }
            }
            get_total_mtu_per_current_cycle: {
                Args: { in_org_id: number }
                Returns: number
            }
            get_total_mtu_per_range: {
                Args: { in_org_id: number; in_start_date: string; in_end_date: string }
                Returns: number
            }
            safe_upsert_mtu_stats: {
                Args: { stats: Database["public"]["Tables"]["mtu_stats"]["Row"][] }
                Returns: undefined
            }
            save_tiles_transaction: {
                Args: {
                    new_tiles: Database["public"]["Tables"]["dashboard_tile"]["Row"][]
                    deleted_tile_ids: number[]
                }
                Returns: undefined
            }
            complete_getting_started_step: {
                Args: {
                    org_id: number
                    step_id: string
                }
                Returns: undefined
            }
        }
        Enums: {
            visual_subtype: "bar" | "line" | "column" | "regular" | "sankey"
            visual_type: "chart" | "table" | "diagram"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            visual_subtype: ["bar", "line", "column", "regular", "sankey"],
            visual_type: ["chart", "table", "diagram"],
        },
    },
} as const
