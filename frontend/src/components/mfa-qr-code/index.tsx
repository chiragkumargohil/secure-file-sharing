import usersApi from "@/apis/users.api";
import { useEffect, useState } from "react";

const MFAQRCode = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await usersApi.getMFAQR();
        const blob = new Blob([response.data], {
          type: "image/png",
        })
        const url = URL.createObjectURL(blob);
        setQrCodeUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQrCode();
  }, []);

  return <div>{qrCodeUrl && <img src={qrCodeUrl} alt="MFA QR Code" />}</div>;
};

export default MFAQRCode;
