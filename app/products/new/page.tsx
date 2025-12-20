import AddProductForm from './add-product-form';

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Product Management
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Manage product photos, packages, gowns, and event details.
          </p>
        </div>

        <AddProductForm />
      </div>
    </div>
  );
}