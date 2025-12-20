import AddClientForm from './add-client-form';

export default function AddClientPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tambahkan Klien Baru
          </h1>
          <p className="text-gray-400">
            Isi rincian di bawah ini untuk menambahkan klien baru ke basis data Anda.
          </p>
        </div>

        <AddClientForm />
      </div>
    </div>
  );
}