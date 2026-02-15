import api from "../services/api"

export default function MapPage() {

  async function testRequest() {
    try {
      const res = await api.get("/")
      console.log(res.data)
    } catch (err) {
      console.log(err.response?.data || err.message)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold">
        Map Page
      </h1>

      <button
        onClick={testRequest}
        className="mt-6 px-4 py-2 bg-green-800 text-white rounded"
      >
        Test API
      </button>
    </div>
  )
}
