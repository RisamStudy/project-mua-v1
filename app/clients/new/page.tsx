import AddClientForm from './add-client-form';

export default function AddClientPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Tambahkan Klien Baru
          </h1>
          <p className="text-gray-600">
            Isi rincian di bawah ini untuk menambahkan klien baru ke basis data Anda.
          </p>
        </div>

        <AddClientForm />
      </div>
    </div>
  );
}