"use client";

interface WhatsAppLinkProps {
  phoneNumber: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppLink({ phoneNumber, label, className = "", children }: WhatsAppLinkProps) {
  // Format nomor HP untuk WhatsApp (hapus karakter non-digit dan tambahkan 62 jika dimulai dengan 0)
  const formatPhoneForWhatsApp = (phone: string) => {
    // Hapus semua karakter non-digit
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Jika dimulai dengan 0, ganti dengan 62
    if (cleanPhone.startsWith('0')) {
      return '62' + cleanPhone.substring(1);
    }
    
    // Jika tidak dimulai dengan 62, tambahkan 62
    if (!cleanPhone.startsWith('62')) {
      return '62' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const handleWhatsAppClick = () => {
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const message = encodeURIComponent(`Halo, saya ingin menanyakan tentang pesanan wedding.`);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-medium mb-1 leading-tight">{label}</span>
        <button
          onClick={handleWhatsAppClick}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors group bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg border border-green-200 hover:border-green-300 w-fit"
        >
          <span className="material-symbols-outlined text-green-600 text-lg group-hover:scale-110 transition-transform flex-shrink-0">
            chat
          </span>
          <span className="font-medium text-gray-800">{phoneNumber}</span>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">WhatsApp</span>
        </button>
      </div>
      {children}
    </div>
  );
}