// This is a utility file to help debug database schema issues

export async function logTableSchema(supabase, tableName: string) {
    try {
        console.log(`Checking schema for table: ${tableName}`)

        // Try to get the first row to see the structure
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (error) {
            console.error(`Error accessing table ${tableName}:`, error.message)
            return false
        }

        // Log the column names if we got data
        if (data && data.length > 0) {
            console.log(`Columns in ${tableName}:`, Object.keys(data[0]))
        } else {
            console.log(`Table ${tableName} exists but is empty`)
        }

        return true
    } catch (error) {
        console.error(`Unexpected error checking ${tableName}:`, error)
        return false
    }
}

export async function checkDatabaseConnection(supabase) {
    try {
        // Simple query to check if the database is accessible
        const { data, error } = await supabase.from("profiles").select("count", { count: "exact" })

        if (error) {
            console.error("Database connection error:", error.message)
            return false
        }

        console.log("Database connection successful")
        return true
    } catch (error) {
        console.error("Unexpected database connection error:", error)
        return false
    }
}
