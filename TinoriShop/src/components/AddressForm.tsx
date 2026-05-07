"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
  districts?: District[];
}

interface Ward {
  code: number;
  name: string;
}

interface AddressFormProps {
  onAddressChange: (address: {
    provinceCode: string;
    provinceName: string;
    districtCode: string;
    districtName: string;
    wardCode: string;
    wardName: string;
  }) => void;
  errors?: {
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
  };
}

export default function AddressForm({ onAddressChange, errors }: AddressFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
        setLoadingProvinces(false);
      })
      .catch(() => setLoadingProvinces(false));
  }, []);

  const handleProvinceChange = async (code: string) => {
    const province = provinces.find((p) => p.code.toString() === code);
    setSelectedProvince(code);
    setSelectedProvinceName(province?.name || "");
    setSelectedDistrict("");
    setSelectedDistrictName("");
    setSelectedWard("");
    setSelectedWardName("");
    setDistricts([]);
    setWards([]);

    if (code) {
      setLoadingDistricts(true);
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${code}?depth=2`
        );
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error(err);
      }
      setLoadingDistricts(false);
    }

    onAddressChange({
      provinceCode: code,
      provinceName: province?.name || "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    });
  };

  const handleDistrictChange = async (code: string) => {
    const district = districts.find((d) => d.code.toString() === code);
    setSelectedDistrict(code);
    setSelectedDistrictName(district?.name || "");
    setSelectedWard("");
    setSelectedWardName("");
    setWards([]);

    if (code) {
      setLoadingWards(true);
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${code}?depth=2`
        );
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error(err);
      }
      setLoadingWards(false);
    }

    onAddressChange({
      provinceCode: selectedProvince,
      provinceName: selectedProvinceName,
      districtCode: code,
      districtName: district?.name || "",
      wardCode: "",
      wardName: "",
    });
  };

  const handleWardChange = (code: string) => {
    const ward = wards.find((w) => w.code.toString() === code);
    setSelectedWard(code);
    setSelectedWardName(ward?.name || "");

    onAddressChange({
      provinceCode: selectedProvince,
      provinceName: selectedProvinceName,
      districtCode: selectedDistrict,
      districtName: selectedDistrictName,
      wardCode: code,
      wardName: ward?.name || "",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5 block">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </Label>
        <Select onValueChange={handleProvinceChange} disabled={loadingProvinces}>
          <SelectTrigger>
            <SelectValue
              placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
            />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={p.code.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.provinceCode && (
          <p className="text-red-500 text-xs mt-1">{errors.provinceCode}</p>
        )}
      </div>

      <div>
        <Label className="mb-1.5 block">
          Quận/Huyện <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={handleDistrictChange}
          disabled={!selectedProvince || loadingDistricts}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !selectedProvince
                  ? "Chọn tỉnh/thành phố trước"
                  : loadingDistricts
                  ? "Đang tải..."
                  : "Chọn quận/huyện"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.code} value={d.code.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.districtCode && (
          <p className="text-red-500 text-xs mt-1">{errors.districtCode}</p>
        )}
      </div>

      <div>
        <Label className="mb-1.5 block">
          Phường/Xã <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={handleWardChange}
          disabled={!selectedDistrict || loadingWards}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !selectedDistrict
                  ? "Chọn quận/huyện trước"
                  : loadingWards
                  ? "Đang tải..."
                  : "Chọn phường/xã"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w.code} value={w.code.toString()}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.wardCode && (
          <p className="text-red-500 text-xs mt-1">{errors.wardCode}</p>
        )}
      </div>
    </div>
  );
}
