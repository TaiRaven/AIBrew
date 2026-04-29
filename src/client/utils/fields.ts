// Helpers for reading ServiceNow field objects returned by Table API

export const display = (field: any): string => field?.display_value ?? ''
export const value   = (field: any): string => field?.value ?? ''
