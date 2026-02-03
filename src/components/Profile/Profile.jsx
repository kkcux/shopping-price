import React, { useRef, useState, useEffect } from 'react';
import { Camera, User, Mail, Info, Crown, Check, LogOut } from 'lucide-react';
import { updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase-config";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { cloudinaryConfig } from "../../cloudinary-config";
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Profile.css';

const Profile = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // เก็บไฟล์ที่เลือกไว้
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // ✅ State สำหรับ membership
  const [membership, setMembership] = useState({ LOTUS: false, BIGC: false, MAKRO: false });

  // ✅ State สำหรับ crop image
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // ขนาดที่แสดง
  const [actualImageSize, setActualImageSize] = useState({ width: 0, height: 0 }); // ขนาดจริงของรูป
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const imageContainerRef = useRef(null);

  // ✅ ดึงตัวย่อชื่อ (ใช้ logic เดียวกับ Navbar)
  const getInitials = (displayName) => {
    if (!displayName) return '';
    return displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    // 1. ดึงจาก LocalStorage (ถ้ามี)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // ป้องกันรูปเสีย: ถ้าเป็น blob (รูปชั่วคราว) ไม่ต้องเอามาโชว์
        if (userData.photoURL && !userData.photoURL.startsWith('blob:')) {
          setProfileImage(userData.photoURL);
        }
        if (userData.name) setName(userData.name);
        if (userData.email) setEmail(userData.email);
        // ✅ โหลด membership จาก localStorage
        if (userData.membership) {
          setMembership(userData.membership);
        }
      } catch {
        // Error parsing user data
      }
    }

    // 2. ดึงจาก Firebase (ตัวจริง)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);

        // ⭐ ส่วนที่เพิ่ม: สั่งให้หน้าจออัปเดตข้อมูลทันทีที่เจอ User
        if (currentUser.displayName) setName(currentUser.displayName);
        if (currentUser.email) setEmail(currentUser.email);
        // ถ้ามีรูปให้แสดงรูป ถ้าไม่มีให้ใช้ตัวย่อชื่อเหมือน Navbar
        if (currentUser.photoURL) {
          setProfileImage(currentUser.photoURL);
        } else {
          setProfileImage(null);
        }

        // ✅ โหลด membership จาก Firestore
        let loadedMembership = { LOTUS: false, BIGC: false, MAKRO: false };
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.membership) {
              loadedMembership = userData.membership;
              setMembership(userData.membership);
            } else {
              // ถ้าไม่มีใน Firestore ให้ลองดึงจาก localStorage
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser);
                  if (userData.membership) {
                    loadedMembership = userData.membership;
                    setMembership(userData.membership);
                  }
                } catch {}
              }
            }
          } else {
            // ถ้าไม่มีใน Firestore ให้ลองดึงจาก localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                if (userData.membership) {
                  loadedMembership = userData.membership;
                  setMembership(userData.membership);
                }
              } catch {}
            }
          }
        } catch (error) {
          console.error("Error loading membership:", error);
          // ถ้าเกิด error ให้ลองดึงจาก localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData.membership) {
                loadedMembership = userData.membership;
                setMembership(userData.membership);
              }
            } catch {}
          }
        }

        // อัปเดตข้อมูลใหม่ลง LocalStorage ด้วย
        const freshUserData = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          membership: loadedMembership
        };
        localStorage.setItem('user', JSON.stringify(freshUserData));

      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // ✅ ฟังก์ชันลดความละเอียดภาพ
  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // คำนวณขนาดใหม่
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ ฟังก์ชันตัดครอบรูป
  const cropImage = (imageSrc, cropArea) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 400; // ขนาดสุดท้ายที่ต้องการ
          canvas.height = 400;
          const ctx = canvas.getContext('2d');

          // ตรวจสอบว่า crop area อยู่ในขอบรูป
          const sourceX = Math.max(0, Math.min(cropArea.x, img.width - cropArea.width));
          const sourceY = Math.max(0, Math.min(cropArea.y, img.height - cropArea.height));
          const sourceWidth = Math.min(cropArea.width, img.width - sourceX);
          const sourceHeight = Math.min(cropArea.height, img.height - sourceY);

          // วาดรูปที่ตัดแล้ว
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            400,
            400
          );

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = imageSrc;
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("ขนาดไฟล์ไม่ควรเกิน 10MB");
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // ✅ ลดความละเอียดภาพก่อน
      const resizedBlob = await resizeImage(file, 1200, 1200, 0.85);
      const imageUrl = URL.createObjectURL(resizedBlob);

      // เปิด modal สำหรับ crop
      setImageToCrop(imageUrl);
      setShowCropModal(true);

      // โหลดรูปเพื่อคำนวณขนาด
      const img = new Image();
      img.onload = () => {
        // เก็บขนาดจริงของรูป (หลัง resize แล้ว)
        setActualImageSize({ width: img.width, height: img.height });

        const containerSize = 400; // ขนาด container
        const imgAspect = img.width / img.height;
        let displayWidth, displayHeight;

        // คำนวณขนาดที่แสดง (ให้พอดีกับ container)
        if (imgAspect > 1) {
          // รูปแนวนอน
          displayWidth = containerSize;
          displayHeight = containerSize / imgAspect;
        } else {
          // รูปแนวตั้ง
          displayHeight = containerSize;
          displayWidth = containerSize * imgAspect;
        }

        setImageSize({ width: displayWidth, height: displayHeight });

        // รอให้ DOM อัปเดตก่อนตั้งค่า crop area
        setTimeout(() => {
          const imgElement = document.querySelector('.crop-image');
          const containerElement = imageContainerRef.current;

          if (imgElement && containerElement) {
            const containerRect = containerElement.getBoundingClientRect();
            const imgRect = imgElement.getBoundingClientRect();

            // คำนวณตำแหน่งของรูปใน container (ลบขอบขาว)
            const imageOffsetX = imgRect.left - containerRect.left;
            const imageOffsetY = imgRect.top - containerRect.top;

            // ตั้งค่า crop area เริ่มต้น (กลางรูป, สี่เหลี่ยมจัตุรัส)
            const cropSize = Math.min(displayWidth, displayHeight);
            setCropArea({
              x: imageOffsetX + (displayWidth - cropSize) / 2,
              y: imageOffsetY + (displayHeight - cropSize) / 2,
              width: cropSize,
              height: cropSize
            });
          } else {
            // Fallback ถ้าไม่เจอ element
            const cropSize = Math.min(displayWidth, displayHeight);
            setCropArea({
              x: (displayWidth - cropSize) / 2,
              y: (displayHeight - cropSize) / 2,
              width: cropSize,
              height: cropSize
            });
          }
        }, 100);
      };
      img.src = imageUrl;
    }
  };

  // ✅ จัดการ drag สำหรับ crop area
  const handleMouseDown = (e, handle = null) => {
    setIsDragging(true);
    setResizeHandle(handle);
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const imgElement = document.querySelector('.crop-image');

    if (!imgElement) return;

    const imgRect = imgElement.getBoundingClientRect();

    // คำนวณตำแหน่งของรูปใน container (ลบขอบขาว)
    const imageOffsetX = imgRect.left - containerRect.left;
    const imageOffsetY = imgRect.top - containerRect.top;
    const imageDisplayWidth = imgElement.offsetWidth;
    const imageDisplayHeight = imgElement.offsetHeight;

    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    const deltaX = mouseX - dragStart.x;
    const deltaY = mouseY - dragStart.y;

    if (resizeHandle) {
      // Resize crop area (จำกัดให้อยู่ในขอบรูปเท่านั้น)
      let newCropArea = { ...cropArea };

      if (resizeHandle === 'se') {
        newCropArea.width = Math.max(100, Math.min(cropArea.width + deltaX, imageOffsetX + imageDisplayWidth - cropArea.x));
        newCropArea.height = Math.max(100, Math.min(cropArea.height + deltaY, imageOffsetY + imageDisplayHeight - cropArea.y));
      } else if (resizeHandle === 'sw') {
        const newWidth = Math.max(100, Math.min(cropArea.width - deltaX, cropArea.x + cropArea.width - imageOffsetX));
        const newX = cropArea.x + cropArea.width - newWidth;
        newCropArea.width = newWidth;
        newCropArea.x = Math.max(imageOffsetX, newX);
        newCropArea.height = Math.max(100, Math.min(cropArea.height + deltaY, imageOffsetY + imageDisplayHeight - cropArea.y));
      } else if (resizeHandle === 'ne') {
        newCropArea.width = Math.max(100, Math.min(cropArea.width + deltaX, imageOffsetX + imageDisplayWidth - cropArea.x));
        const newHeight = Math.max(100, Math.min(cropArea.height - deltaY, cropArea.y + cropArea.height - imageOffsetY));
        const newY = cropArea.y + cropArea.height - newHeight;
        newCropArea.height = newHeight;
        newCropArea.y = Math.max(imageOffsetY, newY);
      } else if (resizeHandle === 'nw') {
        const newWidth = Math.max(100, Math.min(cropArea.width - deltaX, cropArea.x + cropArea.width - imageOffsetX));
        const newX = cropArea.x + cropArea.width - newWidth;
        newCropArea.width = newWidth;
        newCropArea.x = Math.max(imageOffsetX, newX);
        const newHeight = Math.max(100, Math.min(cropArea.height - deltaY, cropArea.y + cropArea.height - imageOffsetY));
        const newY = cropArea.y + cropArea.height - newHeight;
        newCropArea.height = newHeight;
        newCropArea.y = Math.max(imageOffsetY, newY);
      }

      // ทำให้เป็นสี่เหลี่ยมจัตุรัส
      const size = Math.min(newCropArea.width, newCropArea.height);
      newCropArea.width = size;
      newCropArea.height = size;

      // จำกัดให้อยู่ในขอบรูป
      newCropArea.x = Math.max(imageOffsetX, Math.min(newCropArea.x, imageOffsetX + imageDisplayWidth - size));
      newCropArea.y = Math.max(imageOffsetY, Math.min(newCropArea.y, imageOffsetY + imageDisplayHeight - size));

      setCropArea(newCropArea);
      setDragStart({ x: mouseX, y: mouseY });
    } else {
      // Move crop area (จำกัดให้อยู่ในขอบรูปเท่านั้น)
      const x = cropArea.x + deltaX;
      const y = cropArea.y + deltaY;

      const maxX = imageOffsetX + imageDisplayWidth - cropArea.width;
      const maxY = imageOffsetY + imageDisplayHeight - cropArea.height;

      setCropArea({
        ...cropArea,
        x: Math.max(imageOffsetX, Math.min(x, maxX)),
        y: Math.max(imageOffsetY, Math.min(y, maxY))
      });
      setDragStart({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeHandle(null);
  };

  // ✅ ยืนยันการ crop
  const handleConfirmCrop = async () => {
    if (!imageToCrop || actualImageSize.width === 0 || imageSize.width === 0) return;

    try {
      // ดึง element ของรูปและ container
      const imgElement = document.querySelector('.crop-image');
      const containerElement = imageContainerRef.current;

      if (!imgElement || !containerElement) {
        alert("ไม่พบรูปภาพ");
        return;
      }

      // ดึงขนาดจริงของรูปที่แสดง (naturalWidth/naturalHeight)
      const displayedWidth = imgElement.offsetWidth;
      const displayedHeight = imgElement.offsetHeight;

      // ดึงตำแหน่งของรูปใน container (เพื่อหาขอบขาว)
      const containerRect = containerElement.getBoundingClientRect();
      const imgRect = imgElement.getBoundingClientRect();

      // คำนวณ offset ของรูปจาก container (ขอบขาว)
      const imageOffsetX = imgRect.left - containerRect.left;
      const imageOffsetY = imgRect.top - containerRect.top;

      // คำนวณ scale จากขนาดจริงของรูป / ขนาดที่แสดงจริง
      const scaleX = actualImageSize.width / displayedWidth;
      const scaleY = actualImageSize.height / displayedHeight;

      // คำนวณ crop area จริง โดยลบ offset ของขอบขาวออก
      const actualCropArea = {
        x: Math.round((cropArea.x - imageOffsetX) * scaleX),
        y: Math.round((cropArea.y - imageOffsetY) * scaleY),
        width: Math.round(cropArea.width * scaleX),
        height: Math.round(cropArea.height * scaleY)
      };

      // ทำให้เป็นสี่เหลี่ยมจัตุรัส (ใช้ขนาดที่เล็กกว่า)
      const cropSize = Math.min(actualCropArea.width, actualCropArea.height);
      actualCropArea.width = cropSize;
      actualCropArea.height = cropSize;

      // ปรับตำแหน่งให้อยู่ในขอบรูป (ไม่รวมขอบขาว)
      actualCropArea.x = Math.max(0, Math.min(actualCropArea.x, actualImageSize.width - cropSize));
      actualCropArea.y = Math.max(0, Math.min(actualCropArea.y, actualImageSize.height - cropSize));

      // ตัดครอบรูป
      const croppedBlob = await cropImage(imageToCrop, actualCropArea);
      const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });

      setSelectedFile(croppedFile);
      setProfileImage(URL.createObjectURL(croppedBlob));
      setShowCropModal(false);
      setImageToCrop(null);
      setActualImageSize({ width: 0, height: 0 });
    } catch {
      alert("เกิดข้อผิดพลาดในการตัดครอบรูป");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!firebaseUser) {
      alert("ไม่พบข้อมูลผู้ใช้จากระบบ Firebase กรุณาลองล็อกอินใหม่");
      return;
    }

    setUploading(true);

    try {
      let photoURL = firebaseUser.photoURL; // ใช้รูปเดิมก่อน

      // ✅ ถ้ามีไฟล์ใหม่ ให้อัปโหลดไป Cloudinary
      if (selectedFile) {
        try {
          if (!cloudinaryConfig.cloud_name) {
            throw new Error('Cloudinary configuration is missing. Please check VITE_CLOUDINARY_URL in .env file');
          }

          // สร้าง FormData สำหรับอัปโหลด
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('upload_preset', 'ml_default');
          // ใช้ public_id โดยไม่ต้องใส่ folder เพราะ preset ตั้งค่า Asset folder เป็น 'profile-images' แล้ว
          // รูปจะถูกอัปโหลดไปที่: profile-images/{userId}/{timestamp}_profile
          formData.append('public_id', `${firebaseUser.uid}/${Date.now()}_profile`);

          // อัปโหลดไป Cloudinary
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`;
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Upload failed: ${uploadResponse.statusText}`);
          }

          const uploadData = await uploadResponse.json();
          // ใช้ transformation ใน URL สำหรับ crop/resize (400x400, focus on face)
          // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}
          const publicId = uploadData.public_id;
          photoURL = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_400,h_400,c_fill,g_face/${publicId}`;
        } catch (uploadError) {
          let errorMessage = "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ";

          if (uploadError.message) {
            errorMessage += ": " + uploadError.message;
          }

          // แสดง error ที่ชัดเจนขึ้น
          if (uploadError.message?.includes('upload_preset') || uploadError.message?.includes('Invalid')) {
            errorMessage = "กรุณาตรวจสอบ Cloudinary Upload Preset (ml_default) ใน Cloudinary Console\n\n" +
              "ตรวจสอบว่า:\n" +
              "1. Upload Preset ชื่อ 'ml_default' มีอยู่\n" +
              "2. Signing mode เป็น 'Unsigned'\n" +
              "3. Asset folder ตั้งค่าเป็น 'profile-images' (optional)";
          }

          alert(errorMessage);
          setUploading(false);
          return;
        }
      }

      // ✅ อัปเดตชื่อและรูปใน Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: photoURL || null
      });

      // ✅ บันทึก membership ลง Firestore
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, {
          membership: membership
        }, { merge: true });
        
        // ✅ Dispatch custom event เพื่อแจ้งให้ component อื่นทราบ
        window.dispatchEvent(new CustomEvent('membershipUpdated', {
          detail: { membership }
        }));
      } catch (error) {
        console.error("Error saving membership:", error);
      }

      // ✅ อัปเดต LocalStorage
      const updatedUserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        photoURL: photoURL,
        membership: membership
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      // อัปเดต state
      setProfileImage(photoURL);
      setSelectedFile(null);

      setShowPopup(true);

    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // ✅ ฟังก์ชัน Logout
  const handleLogout = async () => {
    try {
      // 1. สั่ง Firebase ให้ Logout
      await signOut(auth);

      // 2. เคลียร์ส่วนอื่นๆ
      googleLogout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // เคลียร์ข้อมูลชั่วคราวอื่นๆ
      localStorage.removeItem('myLists');
      localStorage.removeItem('pending_save_list');
      localStorage.removeItem('current_draft');

      setShowLogoutConfirm(false);

      // 3. ย้ายหน้าและรีเฟรช
      navigate('/login');
      window.location.reload();

    } catch {
      // Error signing out
    }
  };

  const handleRegisterClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // ✅ ฟังก์ชัน toggle membership
  const toggleMembership = (key) => {
    setMembership(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const memberships = [
    {
      id: 1,
      key: 'LOTUS',
      name: "Lotus's",
      label: "Lotus's",
      bgIcon: '#eafff0',
      color: '#00b050',
      logo: 'https://corporate.lotuss.com/images/2023/02/cover-logo-lotuss-060323.jpg',
      registerUrl: 'https://www.lotuss.com/th'
    },
    {
      id: 2,
      key: 'BIGC',
      name: 'Big C',
      label: 'Big C',
      bgIcon: '#f4ffe0',
      color: '#8dc63f',
      logo: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSlLdbffklYPCCfrhKihAv0yGlVjV__NwsYG36F-_hdtTqDGQ97Y3ur0jEvPsFNYH-_CPZQ9Ynu',
      registerUrl: 'https://www.bigc.co.th/auth/register'
    },
    {
      id: 3,
      key: 'MAKRO',
      name: 'Makro',
      label: 'Makro',
      bgIcon: '#fff0f0',
      color: '#ed1c24',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1weBQ9rq_nOC5CSMa2dFW9Ez5CFXKKy4Q3Q&s',
      registerUrl: 'https://www.makro.pro/register'
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="profile-content-section">
        <div className="profile-card fade-in-up">

          <div className="profile-header">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>จัดการข้อมูลส่วนตัวและการเป็นสมาชิกของคุณ</p>
          </div>

          <div className="profile-image-section">
            <div className="image-upload-wrapper" onClick={handleImageClick}>
              <div className="image-circle">
                {profileImage && !profileImage.startsWith('data:image/svg+xml') ? (
                  <>
                    <img src={profileImage} alt="Profile" className="profile-preview" />
                    <div className="image-edit-overlay">
                      <span className="edit-text">แก้ไขรูปโปรไฟล์</span>
                    </div>
                  </>
                ) : name || email ? (
                  <>
                    <div className="user-initials-badge profile-avatar-badge">
                      <span className="initials-text">
                        {getInitials(name || email)}
                      </span>
                    </div>
                    <div className="image-edit-overlay">
                      <span className="edit-text">แก้ไขรูปโปรไฟล์</span>
                    </div>
                  </>
                ) : (
                  <div className="placeholder-content">
                    <Camera size={40} className="placeholder-icon" strokeWidth={1.5} />
                    <span className="upload-text">เปลี่ยนรูปโปรไฟล์</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>

            <div className="form-group">
              <label>ชื่อที่ใช้แสดง</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="เช่น Somchai Jaidee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  readOnly
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
                />
              </div>
            </div>

            <div className="divider"></div>

            <div className="membership-section">
              <label className="section-label">สถานะสมาชิกร้านค้า</label>
              <div className="membership-list">
                {memberships.map((item) => {
                  const isMember = membership[item.key] || false;
                  return (
                    <div key={item.id} className="membership-item">
                      <div className="membership-left">
                        <div className="membership-logo-box" style={{ color: item.color, backgroundColor: item.bgIcon }}>
                          {item.logo ? <img src={item.logo} alt={item.name} className="membership-logo-img" /> : item.name}
                        </div>
                        <div className="membership-info">
                          <span className="ms-name">{item.name}</span>
                          <div className="ms-status-row">
                            <span className="status-text" style={{ color: isMember ? '#10b77e' : '#64748b' }}>
                              {isMember ? 'เป็นสมาชิก' : 'ไม่เป็นสมาชิก'}
                            </span>
                            <div className="info-tooltip-wrapper">
                              <Info size={16} className="info-icon" />
                              <div className="benefit-popup">
                                <div className="popup-header">
                                  <div className="crown-icon-bg"><Crown size={24} color="white" /></div>
                                  <div className="popup-title-text">
                                    <h3>สิทธิประโยชน์</h3>
                                    <span>สมาชิก {item.name}</span>
                                  </div>
                                </div>
                                <ul className="benefit-list">
                                  <li><Check size={16} /> สะสมคะแนนทุกยอดการใช้จ่าย</li>
                                  <li><Check size={16} /> แลกคะแนนเป็นส่วนลดเงินสด</li>
                                  <li><Check size={16} /> สินค้าราคาพิเศษเฉพาะสมาชิก</li>
                                </ul>
                                <div className="popup-footer">
                                  <button type="button" className="popup-btn-ok">เข้าใจแล้ว</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="membership-actions">
                        <label className="membership-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isMember}
                            onChange={() => toggleMembership(item.key)}
                            className="membership-checkbox"
                          />
                          <span className={`membership-checkbox-custom ${isMember ? 'checked' : ''}`}>
                            {isMember && <Check size={14} strokeWidth={3} />}
                          </span>
                          <span className="membership-checkbox-text">สมาชิก</span>
                        </label>
                        {!isMember && (
                          <button 
                            type="button" 
                            className="btn-apply-member" 
                            onClick={() => handleRegisterClick(item.registerUrl)}
                          >
                            สมัคร
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <div className="form-actions-left">
                <button type="submit" className="btn-save" disabled={uploading}>
                  {uploading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
                <button type="button" className="btn-cancel" disabled={uploading}>ยกเลิก</button>
              </div>
              <button
                type="button"
                className="btn-logout-profile"
                onClick={() => setShowLogoutConfirm(true)}
                disabled={uploading}
              >
                <LogOut size={18} style={{ margin: 0, padding: 0, display: 'block' }} />
                <span style={{ margin: 0, padding: 0 }}>ออกจากระบบ</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {showPopup && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content fade-in-scale">
            <div className="profile-modal-icon-wrapper">
              <Check size={40} className="profile-modal-check-icon" />
            </div>
            <h2 className="profile-modal-title">บันทึกข้อมูลแล้ว</h2>
            <p className="profile-modal-subtitle">ข้อมูลถูกอัปเดตเรียบร้อยแล้ว</p>
            <button className="profile-modal-btn-close" onClick={closePopup}>
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="profile-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="profile-modal-content fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile-modal-title">ยืนยันการออกจากระบบ</h2>
            <p className="profile-modal-subtitle">คุณต้องการออกจากระบบใช่หรือไม่?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '10px 24px' }}
              >
                ยกเลิก
              </button>
              <button
                className="btn-logout-confirm"
                onClick={handleLogout}
                style={{
                  padding: '10px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal สำหรับ crop image */}
      {showCropModal && imageToCrop && (
        <div className="crop-modal-overlay" onClick={() => setShowCropModal(false)}>
          <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="crop-modal-title">ตัดครอบรูปโปรไฟล์</h3>
            <p className="crop-modal-subtitle">ลากเพื่อเลือกส่วนที่ต้องการ</p>

            <div
              className="crop-container"
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={imageToCrop}
                alt="Crop"
                className="crop-image"
                style={{
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`
                }}
              />
              <div
                className="crop-area"
                style={{
                  left: `${cropArea.x}px`,
                  top: `${cropArea.y}px`,
                  width: `${cropArea.width}px`,
                  height: `${cropArea.height}px`
                }}
                onMouseDown={(e) => handleMouseDown(e, null)}
              >
                <div
                  className="crop-handle crop-handle-nw"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'nw');
                  }}
                ></div>
                <div
                  className="crop-handle crop-handle-ne"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'ne');
                  }}
                ></div>
                <div
                  className="crop-handle crop-handle-sw"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'sw');
                  }}
                ></div>
                <div
                  className="crop-handle crop-handle-se"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'se');
                  }}
                ></div>
              </div>
            </div>

            <div className="crop-actions">
              <button
                className="btn-crop-cancel"
                onClick={() => {
                  setShowCropModal(false);
                  setImageToCrop(null);
                }}
              >
                ยกเลิก
              </button>
              <button
                className="btn-crop-confirm"
                onClick={handleConfirmCrop}
              >
                ตัดครอบ
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;