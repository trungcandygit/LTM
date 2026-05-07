import { z } from "zod";

export const vnPhoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)"),
  customerPhone: z
    .string()
    .regex(vnPhoneRegex, "Số điện thoại không hợp lệ (phải là số Việt Nam)"),
  customerEmail: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  provinceCode: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  provinceName: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  districtCode: z.string().min(1, "Vui lòng chọn quận/huyện"),
  districtName: z.string().min(1, "Vui lòng chọn quận/huyện"),
  wardCode: z.string().min(1, "Vui lòng chọn phường/xã"),
  wardName: z.string().min(1, "Vui lòng chọn phường/xã"),
  detailedAddress: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)"),
  note: z.string().optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "MOMO"]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  price: z.number().min(0, "Giá không được âm"),
  salePrice: z.number().min(0, "Giá sale không được âm").optional().nullable(),
  stock: z.number().int().min(0, "Tồn kho không được âm"),
  categoryId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
