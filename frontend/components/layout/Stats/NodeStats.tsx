export default function NodeStats() {
    return (
      <div className="flex items-start gap-10 px-5 py-2 w-full">
        <div className="text-lg font-bold text-gray-700 whitespace-nowrap">
          32,960 params
        </div>
  
        <div className="flex flex-1 flex-col text-sm space-y-1">
          <div className="flex justify-between w-full">
            <span className="text-gray-700">Input shape</span>
            <span className="text-gray-500">(8,)</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-gray-700">Output shape</span>
            <span className="text-gray-500">(32,)</span>
          </div>
        </div>
      </div>
    );
}