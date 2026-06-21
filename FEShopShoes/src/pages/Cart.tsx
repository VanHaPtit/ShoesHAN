import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { TrashIcon } from '../components/common/SimpleIcons';
import {
  CreditCard,
  Truck,
  Wallet,
  X,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'COD' | 'VNPAY' | 'PAYPAL';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

interface ShippingInfo {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
}

// ─── Shipping Info Modal ───────────────────────────────────────────────────────

const ShippingModal: React.FC<{
  onClose: () => void;
  onNext: (info: ShippingInfo) => void;
  initialData: ShippingInfo;
  finalAmount: number;
}> = ({ onClose, onNext, initialData, finalAmount }) => {
  const [form, setForm] = useState<ShippingInfo>(initialData);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [useDefaultAddress, setUseDefaultAddress] = useState<boolean>(true);
  const [defaultProfile, setDefaultProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const { id } = JSON.parse(savedUser);
          const response = await axiosClient.get(`/users/${id}`);
          setDefaultProfile(response.data);

          const addr = response.data.address;
          const fullAddress = addr && addr.province ? `${addr.specificAddress ? addr.specificAddress + ', ' : ''}${addr.ward ? addr.ward + ', ' : ''}${addr.province}` : '';

          if (useDefaultAddress && response.data.fullName && response.data.phone && fullAddress) {
            setForm({
              receiverName: response.data.fullName,
              receiverPhone: response.data.phone,
              shippingAddress: fullAddress,
            });
          } else {
            setUseDefaultAddress(false);
          }
        } else {
          setUseDefaultAddress(false);
        }
      } catch (err) {
        setUseDefaultAddress(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleToggleMode = (isDefault: boolean) => {
    setUseDefaultAddress(isDefault);
    setErrors({});
    if (isDefault && defaultProfile) {
      const addr = defaultProfile.address;
      const fullAddress = addr && addr.province ? `${addr.specificAddress ? addr.specificAddress + ', ' : ''}${addr.ward ? addr.ward + ', ' : ''}${addr.province}` : '';
      setForm({
        receiverName: defaultProfile.fullName || '',
        receiverPhone: defaultProfile.phone || '',
        shippingAddress: fullAddress,
      });
    } else {
      setForm({ receiverName: '', receiverPhone: '', shippingAddress: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};
    if (!form.receiverName.trim())
      newErrors.receiverName = 'Vui lòng nhập họ tên người nhận';
    if (!form.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.receiverPhone.trim())) {
      newErrors.receiverPhone = 'Số điện thoại không hợp lệ';
    }
    if (!form.shippingAddress.trim())
      newErrors.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onNext(form);
  };

  const inputBase =
    'w-full border-2 border-[#E2E8F0] px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0F172A] transition-colors placeholder:text-gray-300';
  const inputError = 'border-red-400 focus:border-red-500 bg-red-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md border-2 border-[#0F172A] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] p-5 shrink-0">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">
              THÔNG TIN GIAO HÀNG
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
              Bước 1/2 — Điền địa chỉ nhận hàng
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5 overflow-y-auto shrink">
          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#0F172A]" /></div>
          ) : (
            <>
              {/* Address Mode Selection */}
              {defaultProfile && defaultProfile.phone && defaultProfile.address?.province && (
                <div className="flex gap-4 border-b border-[#E2E8F0] pb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input type="radio" checked={useDefaultAddress} onChange={() => handleToggleMode(true)} className="accent-[#0F172A] w-4 h-4" />
                    Sử dụng địa chỉ mặc định
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input type="radio" checked={!useDefaultAddress} onChange={() => handleToggleMode(false)} className="accent-[#0F172A] w-4 h-4" />
                    Thêm địa chỉ mới
                  </label>
                </div>
              )}

              <div className="space-y-4">
                {/* Họ tên */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-600 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    value={form.receiverName}
                    disabled={useDefaultAddress}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, receiverName: e.target.value }));
                      if (errors.receiverName) setErrors((er) => ({ ...er, receiverName: undefined }));
                    }}
                    placeholder="Nguyễn Văn A"
                    className={`${inputBase} ${useDefaultAddress ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''} ${errors.receiverName ? inputError : ''}`}
                  />
                  {errors.receiverName && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.receiverName}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-600 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={form.receiverPhone}
                    disabled={useDefaultAddress}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, receiverPhone: e.target.value }));
                      if (errors.receiverPhone) setErrors((er) => ({ ...er, receiverPhone: undefined }));
                    }}
                    placeholder="0912 345 678"
                    className={`${inputBase} ${useDefaultAddress ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''} ${errors.receiverPhone ? inputError : ''}`}
                  />
                  {errors.receiverPhone && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.receiverPhone}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-600 mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Địa chỉ giao hàng *
                  </label>
                  <textarea
                    value={form.shippingAddress}
                    disabled={useDefaultAddress}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, shippingAddress: e.target.value }));
                      if (errors.shippingAddress)
                        setErrors((er) => ({ ...er, shippingAddress: undefined }));
                    }}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    className={`${inputBase} resize-none ${useDefaultAddress ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''} ${errors.shippingAddress ? inputError : ''}`}
                  />
                  {errors.shippingAddress && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.shippingAddress}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t-2 border-[#0F172A] flex items-center justify-between gap-3">
          <div className="text-[12px] text-gray-500 font-medium">
            Tổng:{' '}
            <span className="text-[#0F172A] font-black text-sm">{formatCurrency(finalAmount)}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-black text-white px-6 py-3.5 font-bold uppercase text-xs tracking-widest hover:bg-gray-900 transition-colors"
          >
            TIẾP THEO
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Payment Method Modal ──────────────────────────────────────────────────────

const PaymentModal: React.FC<{
  onClose: () => void;
  onBack: () => void;
  onConfirm: (method: PaymentMethod) => void;
  isLoading: boolean;
  finalAmount: number;
  shippingInfo: ShippingInfo;
}> = ({ onClose, onBack, onConfirm, isLoading, finalAmount, shippingInfo }) => {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'COD',
      label: 'Thanh toán khi nhận hàng',
      description: 'Trả tiền mặt khi shipper giao hàng tận nơi',
      icon: <Truck className="w-6 h-6" />,
    },
    {
      id: 'VNPAY',
      label: 'Thanh toán VNPay',
      description: 'Thẻ ATM, Internet Banking, QR Code',
      icon: <CreditCard className="w-6 h-6" />,
      badge: 'PHỔ BIẾN',
    },
    {
      id: 'PAYPAL',
      label: 'Thanh toán PayPal',
      description: 'Thẻ tín dụng quốc tế (USD)',
      icon: <Wallet className="w-6 h-6" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md border-2 border-[#0F172A] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] p-5">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">CHỌN THANH TOÁN</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
              Bước 2/2 — Tổng cộng:{' '}
              <span className="text-[#0F172A] font-black">{formatCurrency(finalAmount)}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shipping info summary */}
        <div className="px-5 pt-4 pb-0">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Giao đến
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {shippingInfo.receiverName}
              <span className="text-gray-400 font-medium">—</span>
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {shippingInfo.receiverPhone}
            </div>
            <div className="flex items-start gap-2 text-[12px] text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{shippingInfo.shippingAddress}</span>
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="p-5 space-y-3">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`w-full flex items-center gap-4 p-4 border-2 transition-all text-left relative
                ${selected === option.id
                  ? 'border-[#5ecad1] bg-[#5ecad1] text-white'
                  : 'border-[#E2E8F0] hover:border-[#5ecad1] hover:bg-[#5ecad1]/5'
                }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border
                  ${selected === option.id
                    ? 'border-white/30 bg-white/20'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
              >
                {option.icon}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase text-sm">{option.label}</span>
                  {option.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5
                        ${selected === option.id
                          ? 'bg-white text-[#5ecad1]'
                          : 'bg-black text-white'
                        }`}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${selected === option.id ? 'text-white/80' : 'text-gray-500'
                    }`}
                >
                  {option.description}
                </p>
              </div>
              {selected === option.id && (
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t-2 border-[#0F172A] flex gap-3">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 border-2 border-[#0F172A] px-4 py-3.5 font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            QUAY LẠI
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected || isLoading}
            className="flex-1 bg-black text-white py-3.5 font-bold uppercase text-sm tracking-widest hover:bg-gray-900 flex items-center justify-center gap-3 disabled:bg-gray-200 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
            ) : (
              'XÁC NHẬN THANH TOÁN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Checkbox ───────────────────────────────────────────────────────────

const Checkbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`flex-shrink-0 w-5 h-5 border-2 transition-all flex items-center justify-center
      ${checked ? 'bg-black border-[#0F172A]' : 'bg-white border-gray-300 hover:border-[#0F172A]'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    aria-checked={checked}
    role="checkbox"
  >
    {checked && (
      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

// ─── Modal step state ──────────────────────────────────────────────────────────

type ModalStep = 'closed' | 'shipping' | 'payment';

// ─── Main Cart Component ───────────────────────────────────────────────────────

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast(); // ✅ FIX: Hook phải được gọi bên trong component

  const {
    cart,
    removeFromCart,
    updateQuantity,
    shippingFee: contextShippingFee,
    isLoading: cartLoading,
  } = useCart();

  // ── Selection state — mặc định tích hết ──────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    () => new Set(cart.map((i) => i.id))
  );

  const toggleItem = (id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allChecked = cart.length > 0 && cart.every((i) => selectedIds.has(i.id));
  const someChecked = cart.some((i) => selectedIds.has(i.id));

  const toggleAll = () => {
    setSelectedIds(allChecked ? new Set() : new Set(cart.map((i) => i.id)));
  };

  const [productImageCache, setProductImageCache] = useState<Record<number, string>>({});

  const resolveCartItemImage = (item: any) => {
    const product = item.product || item.variant?.product;
    const imageFromProduct = product && Array.isArray(product.images)
      ? product.images[0]
      : product?.images;
    return (
      item.image ||
      imageFromProduct ||
      product?.image ||
      product?.imageUrl ||
      (typeof product?.id === 'number' ? productImageCache[product.id] : undefined) ||
      'https://placehold.co/400x400?text=No+Image'
    );
  };

  useEffect(() => {
    const missingProductIds = cart
      .filter((item) => {
        const product = item.product || item.variant?.product;
        const hasImage = item.image ||
          (product && Array.isArray(product.images) ? product.images[0] : product?.images) ||
          product?.image ||
          product?.imageUrl ||
          (typeof product?.id === 'number' ? Boolean(productImageCache[product.id]) : false);
        return !hasImage && typeof product?.id === 'number';
      })
      .map((item) => (item.product || item.variant?.product)?.id)
      .filter((id, index, arr) => id !== undefined && arr.indexOf(id) === index) as number[];

    if (missingProductIds.length === 0) return;

    const fetchMissingImages = async () => {
      try {
        const results = await Promise.allSettled(
          missingProductIds.map((id) => axiosClient.get(`/product/${id}`))
        );

        const nextCache = results.reduce<Record<number, string>>((acc, result, idx) => {
          if (result.status === 'fulfilled') {
            const data = result.value.data;
            const image = Array.isArray(data.images) ? data.images[0] : data.images;
            acc[missingProductIds[idx]] = image || data.image || data.imageUrl || '';
          }
          return acc;
        }, {});

        if (Object.keys(nextCache).length > 0) {
          setProductImageCache((prev) => ({ ...prev, ...nextCache }));
        }
      } catch (err) {
        console.warn('Không thể tải ảnh sản phẩm bổ sung cho giỏ hàng', err);
      }
    };

    fetchMissingImages();
  }, [cart, productImageCache]);

  // ── Selected items & totals ───────────────────────────────────────────────
  const selectedItems = useMemo(
    () => cart.filter((i) => selectedIds.has(i.id)),
    [cart, selectedIds]
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    [selectedItems]
  );

  const SHIPPING_THRESHOLD = 500000;
  const selectedShippingFee =
    selectedItems.length === 0
      ? 0
      : selectedSubtotal >= SHIPPING_THRESHOLD
        ? 0
        : contextShippingFee;

  const selectedFinalAmount = selectedSubtotal + selectedShippingFee;

  // ── Kiểm tra có sản phẩm nào vượt quá tồn kho không ─────────────────────
  const overStockItems = useMemo(
    () => selectedItems.filter((i) => i.quantity > (i.variant?.stock ?? 0)),
    [selectedItems]
  );
  const hasOverStock = overStockItems.length > 0;

  // ── Quantity handler với kiểm tra stock ──────────────────────────────────
  // ✅ FIX: Hàm này phải nằm bên trong component để dùng được updateQuantity và showToast
  const handleUpdateQuantity = (item: any, newQty: number) => {
    if (newQty > item.quantity) {
      // Nếu là thao tác TĂNG số lượng
      if (newQty > item.variant.stock) {
        showToast(`Rất tiếc, chỉ còn ${item.variant.stock} sản phẩm trong kho`, 'error');
        return;
      }
    }
    if (newQty >= 1) {
      updateQuantity(item.id, newQty);
    }
  };

  const { user } = useAuth();

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    receiverName: user?.fullName || '',
    receiverPhone: user?.phone || '',
    shippingAddress: user?.address
      ? `${user.address.specificAddress || ''}, ${user.address.ward || ''}, ${user.address.province || ''}`.replace(/^[\s,]+|[\s,]+$/g, '').replace(/,(\s*,)+/g, ',')
      : '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const totalLoading = cartLoading || isProcessing;

  const handleOpenCheckout = () => setModalStep('shipping');
  const handleCloseAll = () => setModalStep('closed');
  const handleShippingNext = (info: ShippingInfo) => {
    setShippingInfo(info);
    setModalStep('payment');
  };
  const handlePaymentBack = () => setModalStep('shipping');

  // ── Build order payload ───────────────────────────────────────────────────
  const prepareOrderData = (paymentMethod: PaymentMethod) => ({
    totalPrice: selectedFinalAmount,
    status: 'PENDING',
    paymentMethod,
    receiverName: shippingInfo.receiverName,
    receiverPhone: shippingInfo.receiverPhone,
    shippingAddress: shippingInfo.shippingAddress,
    items: selectedItems.map((item) => ({
      variant: { id: item.variant.id },
      quantity: item.quantity,
      price: item.price,
    })),
  });

  // ── Payment handler ───────────────────────────────────────────────────────
  const handleConfirmPayment = async (method: PaymentMethod) => {
    setIsProcessing(true);
    const orderData = prepareOrderData(method);
    try {
      switch (method) {
        case 'COD': {
          const response = await axiosClient.post('/orders', orderData);
          const orderNumber = response.data.orderNumber;
          selectedItems.forEach((item) => removeFromCart(item.id, true));
          // Handle successful COD payment exactly like PayPal/VNPay success redirects
          navigate(`/?payment=success&order=${orderNumber}`);
          break;
        }
        case 'VNPAY': {
          const orderRes = await axiosClient.post('/orders', orderData);
          const orderNumber =
            orderRes.data?.orderNumber || orderRes.data?.data?.orderNumber;
          const amount = Math.round(selectedFinalAmount);
          if (!orderNumber) throw new Error('Không có mã đơn hàng');
          const vnPayRes = await axiosClient.get('/payment/vn-pay', {
            params: { orderNumber, amount, domain: window.location.origin },
          });
          const paymentUrl =
            vnPayRes.data?.paymentUrl ||
            vnPayRes.data?.data?.paymentUrl ||
            vnPayRes.data;
          if (paymentUrl) {
            localStorage.setItem('checkoutItems', JSON.stringify(selectedItems.map(item => item.id)));
            window.location.href = paymentUrl;
          }
          break;
        }
        case 'PAYPAL': {
          const response = await axiosClient.post('/paypal', orderData, {
            params: { domain: window.location.origin }
          });
          const approvalUrl = response.data;
          if (approvalUrl && typeof approvalUrl === 'string') {
            localStorage.setItem('checkoutItems', JSON.stringify(selectedItems.map(item => item.id)));
            window.location.href = approvalUrl;
          } else throw new Error('Không nhận được link thanh toán PayPal');
          break;
        }
      }
    } catch (error: any) {
      console.error('[Payment Error]', error);
      showToast(
        error.response?.data?.message || error.message || 'Lỗi xử lý đơn hàng',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Empty / Loading states ────────────────────────────────────────────────

  if (cartLoading && cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#0F172A] mb-4" />
        <p className="font-bold uppercase tracking-widest text-gray-400">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">GIỎ HÀNG TRỐNG</h1>
        <Link
          to="/shop"
          className="inline-block bg-black text-white px-10 py-4 font-bold uppercase text-sm hover:opacity-80"
        >
          MUA SẮM NGAY
        </Link>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      {/* Step 1: Shipping info */}
      {modalStep === 'shipping' && (
        <ShippingModal
          onClose={handleCloseAll}
          onNext={handleShippingNext}
          initialData={shippingInfo}
          finalAmount={selectedFinalAmount}
        />
      )}

      {/* Step 2: Payment method */}
      {modalStep === 'payment' && (
        <PaymentModal
          onClose={handleCloseAll}
          onBack={handlePaymentBack}
          onConfirm={handleConfirmPayment}
          isLoading={totalLoading}
          finalAmount={selectedFinalAmount}
          shippingInfo={shippingInfo}
        />
      )}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-10 py-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">
          GIỎ HÀNG CỦA BẠN
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-8 space-y-0">

            {/* Select All header */}
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0F172A] mb-2">
              <button
                onClick={toggleAll}
                disabled={totalLoading}
                className={`flex-shrink-0 w-5 h-5 border-2 transition-all flex items-center justify-center cursor-pointer
                  ${allChecked || someChecked
                    ? 'bg-black border-[#0F172A]'
                    : 'bg-white border-gray-300 hover:border-[#0F172A]'
                  }`}
                aria-label="Chọn tất cả"
              >
                {allChecked ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : someChecked ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6h8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : null}
              </button>
              <span className="font-bold uppercase text-xs tracking-widest text-gray-600">
                Chọn tất cả ({cart.length} sản phẩm)
              </span>
              {someChecked && (
                <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Đã chọn {selectedItems.length}/{cart.length}
                </span>
              )}
            </div>

            {/* Item list */}
            {/* ✅ FIX: Xóa bộ nút +/- trùng lặp bên ngoài layout, chỉ giữ bộ bên trong details */}
            <div className="space-y-6">
              {cart.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const unitPrice = item.price || 0;
                const atStockLimit = item.quantity >= item.variant?.stock;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row border-b pb-6 transition-opacity duration-200
                      ${isSelected ? 'opacity-100 border-[#E2E8F0]' : 'opacity-40 border-[#E2E8F0]'}`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-start pt-1 pr-4 flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        disabled={totalLoading}
                      />
                    </div>

                    {/* Image */}
                    <div className="w-full sm:w-40 aspect-square bg-gray-100 flex-shrink-0">
                      <img
                        src={resolveCartItemImage(item)}
                        alt={(item.product || item.variant?.product)?.name || 'Sản phẩm'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow sm:ml-6 mt-4 sm:mt-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-bold uppercase text-lg italic">
                            {(item.product || item.variant?.product)?.name}
                          </h3>
                          <p className="text-[12px] font-bold uppercase text-gray-500">
                            Màu: {item.variant?.color} | Size: {item.variant?.size}
                          </p>

                          {/* FIX: Chỉ còn 1 bộ nút +/-, dùng handleUpdateQuantity kiểm tra stock */}
                          <div className="flex items-center space-x-4 mt-4">
                            <div className="flex items-center border border-[#0F172A] h-10">
                              <button
                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || totalLoading}
                                className="px-3 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                aria-label="Giảm số lượng"
                              >
                                −
                              </button>
                              <span className="w-10 text-center font-bold text-xs select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                disabled={totalLoading || atStockLimit}
                                className={`px-3 transition-colors ${atStockLimit
                                  ? 'cursor-not-allowed text-gray-300'
                                  : 'hover:bg-gray-100'
                                  }`}
                                aria-label="Tăng số lượng"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              disabled={totalLoading}
                              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                              aria-label="Xóa sản phẩm"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Cảnh báo đạt giới hạn stock */}
                          {atStockLimit && (
                            <p className="text-[10px] text-red-500 font-bold uppercase mt-1">
                              Đã đạt tối đa kho (Còn {item.variant.stock})
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="font-bold text-lg">{formatCurrency(unitPrice)}</div>
                          {item.quantity > 1 && (
                            <>
                              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                                đơn giá / sản phẩm
                              </div>
                              <div className="font-bold text-sm text-gray-700 mt-1">
                                = {formatCurrency(unitPrice * item.quantity)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-4">
            <div className="border-2 border-[#0F172A] p-6 space-y-6 sticky top-24">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                TÓM TẮT ĐƠN HÀNG
              </h2>

              {selectedItems.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-[12px]">
                      <span className="text-gray-600 truncate max-w-[60%]">
                        {(item.product || item.variant?.product)?.name}
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="font-bold flex-shrink-0 ml-2">
                        {formatCurrency((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400 italic">
                  Chưa có sản phẩm nào được chọn
                </p>
              )}

              <div className="space-y-4 text-[13px] font-medium uppercase border-t border-[#E2E8F0] pt-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vận chuyển</span>
                  <span className="font-bold">
                    {selectedItems.length === 0
                      ? '—'
                      : selectedShippingFee === 0
                        ? 'MIỄN PHÍ'
                        : formatCurrency(selectedShippingFee)}
                  </span>
                </div>

                {/* Thông báo miễn phí vận chuyển */}
                {selectedItems.length > 0 && selectedSubtotal < SHIPPING_THRESHOLD && (
                  <p className="text-[11px] text-gray-400 font-medium -mt-2">
                    Mua thêm{' '}
                    <span className="text-[#0F172A] font-black">
                      {formatCurrency(SHIPPING_THRESHOLD - selectedSubtotal)}
                    </span>{' '}
                    để được miễn phí vận chuyển
                  </p>
                )}

                <hr className="border-[#E2E8F0]" />
                <div className="flex justify-between text-lg font-black italic">
                  <span>TỔNG CỘNG</span>
                  <span>{formatCurrency(selectedFinalAmount)}</span>
                </div>
              </div>

              {/* Cảnh báo vượt kho */}
              {hasOverStock && (
                <div className="bg-red-50 border-2 border-red-400 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-1">
                    ⚠ Vượt quá số lượng tồn kho
                  </p>
                  <ul className="space-y-0.5">
                    {overStockItems.map((i) => (
                      <li key={i.id} className="text-[11px] text-red-400 font-medium">
                        {(i.product || i.variant?.product)?.name} — chỉ còn{' '}
                        <span className="font-black">{i.variant?.stock}</span> sản phẩm
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleOpenCheckout}
                disabled={totalLoading || selectedItems.length === 0 || hasOverStock}
                className="w-full bg-black text-white py-4 font-bold uppercase text-sm hover:bg-gray-900 transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {totalLoading ? (
                  'ĐANG XỬ LÝ...'
                ) : selectedItems.length === 0 || hasOverStock ? (
                  'CHƯA CHỌN SẢN PHẨM'
                ) : (
                  <>
                    THANH TOÁN ({selectedItems.length})
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;