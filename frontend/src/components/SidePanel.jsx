export default function SidePanel(props) {
  if (!props.site) return null

  return (
    <div className="fixed top-0 right-0 h-full w-[35%] bg-white shadow-2xl z-[1000] p-6 overflow-y-auto">
      <button
        onClick={props.onClose}
        className="mb-4 text-sm text-gray-500"
      >
        Close
      </button>

      <h2 className="text-2xl font-semibold mb-2">
        {props.site.name}
      </h2>

      <p className="text-gray-600 mb-2">
        {props.site.country}
      </p>

      <p className="text-sm mb-6">
        Category: {props.site.category}
      </p>

      <button className="mt-4 px-4 py-2 bg-green-800 text-white rounded">
        View Details
      </button>
    </div>
  )
}
