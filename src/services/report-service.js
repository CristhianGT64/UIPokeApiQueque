import settings from "@/lib/settings";

export async function getReports() {
    try {
      const response = await fetch(`${settings.URL}/api/request`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response (GET):", data) // Para depurar la estructura de datos

      return Array.isArray(data) ? data : data.results || data.data || []
    } catch (error) {
      console.error("Error fetching reports:", error)
      throw error
    }
  }

  export async function createReport(pokemonType, maxRecords) {
    try {
      const response = await fetch(`${settings.URL}/api/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pokemon_type: pokemonType,
          sample_size : maxRecords
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response (POST):", data) // Para depurar la respuesta

      return data
    } catch (error) {
      console.error("Error creating report:", error)
      throw error
    }
  }

  export async function deleteReport(reportId) {
    try {
      if (!reportId) throw new Error("reportId is required")

      const response = await fetch(`${settings.URL}/api/request/${reportId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json().catch(() => ({}))
      console.log("API Response (DELETE):", data)

      return data
    } catch (error) {
      console.error("Error deleting report:", error)
      throw error
    }
  }