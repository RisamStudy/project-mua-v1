import AddProductForm from './add-product-form';

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Product Management
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage product photos, packages, gowns, and event details.
          </p>
        </div>

        <AddProductForm />
      </div>
    </div>
  );
}