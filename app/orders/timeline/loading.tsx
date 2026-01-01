export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="text-center">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2 mx-auto"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Date Indicators Skeleton */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Custom Options */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}