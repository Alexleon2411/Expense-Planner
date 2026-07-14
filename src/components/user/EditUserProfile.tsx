import { useState } from "react"
import type { UpdateProfileData, User } from "../../types/user"
import { useAuth } from "../../hooks/useAuth"

// type User = {
//   id: string
//   name: string
//   email: string
//   salary?: string
//   address?: string
//   language?: string
//   phoneNumber?: string
// }

type Props = {
  user?: User
  handeEditeProfile: () => void
}

export default function EditUserProfile({ user, handeEditeProfile}: Props) {
   
  const [name, setName] = useState(user?.name ?? "")
  const { editProfile } = useAuth()
  const [email, setEmail] = useState(user?.email ?? "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "")
  const [street, setStreet] = useState(user?.street ?? "")
  const [houseNumber, setHouseNumber] = useState(user?.houseNumber ?? "")
  const [city, setCity] = useState(user?.city ?? "")
  const [country, setCountry] = useState(user?.country ?? "")
  const [language, setLanguage] = useState(user?.language || "Spanish (Español)")

  const handleEditProfile = async (data: UpdateProfileData) => {
    const updateData: Partial<UpdateProfileData> = {};
    updateData.id = user?.id ?? "";

    if (data.name && data.name.trim() !== "") {
      updateData.name = data.name.trim();
    }

    if (data.email && data.email.trim() !== "") {
      updateData.email = data.email.trim();
    }

    if (data.street && data.street.trim() !== "") {
      updateData.street = data.street.trim();
    }

    if (data.houseNumber && data.houseNumber.trim() !== "") {
      updateData.houseNumber = data.houseNumber.trim();
    }

    if (data.city && data.city.trim() !== "") {
      updateData.city = data.city.trim();
    }

    if (data.country && data.country.trim() !== "") {
      updateData.country = data.country.trim();
    }

    if (data.language && data.language.trim() !== "") {
      updateData.language = data.language;
    }

    if (data.phoneNumber && data.phoneNumber.trim() !== "") {
      updateData.phoneNumber = data.phoneNumber.trim();
    }
    // console.log('update information', updateData);
    await editProfile(updateData);  
    handeEditeProfile();
  };

  return (
    <div>
        <div
            className="fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
            onClick={handeEditeProfile}
        ></div>
        <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-lg "
            role="dialog"
            aria-modal="true"
            onClick={handeEditeProfile}
        >
            <div className="max-w-5xl mx-auto bg-white rounded-md p-lg" onClick={(e) => e.stopPropagation()}>
                {/* <!-- Header Section --> */}
                
                {/* <!-- Bento Grid Layout --> */}
                <div className="grid grid-cols-12 ">
                    {/* <!-- Left Column: Avatar & Quick Actions --> */}
                    {/* <div className="col-span-12 lg:col-span-4 space-y-gutter">
                        
                        <div className="bento-card">
                            <span className="text-label-caps text-on-surface-variant mb-md block">SECURITY &amp; ACCESS</span>
                            <div className="space-y-md">
                                <button className="w-full flex items-center justify-between p-md bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
                                    <div className="flex items-center gap-md">
                                        <span className="material-symbols-outlined text-primary">lock_reset</span>
                                        <div className="text-left">
                                            <p className="text-body-md font-bold">Change Password</p>
                                            <p className="text-body-sm text-on-surface-variant">Last updated 3 months ago</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-md bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
                                    <div className="flex items-center gap-md">
                                        <span className="material-symbols-outlined text-secondary">verified_user</span>
                                        <div className="text-left">
                                            <p className="text-body-md font-bold">Two-Factor Auth</p>
                                            <p className="text-body-sm text-secondary font-medium">Currently Enabled</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div> */}
                    {/* <!-- Right Column: Form Sections --> */}
                    <div className="col-span-12 lg:col-span-12 space-y-gutter">
                        {/* <!-- Personal Information Form --> */}
                        <div className="bento-card">
                            <span className="text-label-caps text-white bg-primary-container p-lg rounded-lg mb-xl block">PERSONAL INFORMATION</span>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                                <div className="md:col-span-2">
                                  <label className="block text-body-sm font-bold mb-xs">Full Name</label>
                                  <input 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      type="text"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                  />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Email Address</label>
                                    <div className="relative">
                                        <input 
                                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                           type="email" 
                                           value={email}
                                           onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Phone Number</label>
                                    <input 
                                   className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    type="tel" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                   />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Street</label>
                                    <input 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      type="text" 
                                      value={street}
                                      onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">House Number</label>
                                    <input 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      type="text" 
                                      value={houseNumber}
                                      onChange={(e) => setHouseNumber(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">City</label>
                                    <input 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      type="text" 
                                      value={city}
                                      onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Country</label>
                                    <input 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      type="text" 
                                      value={country}
                                      onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-body-sm font-bold mb-xs">City</label>
                                    <input className="input-field text-body-md" type="text" value="Madrid" />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Country</label>
                                    <select className="input-field text-body-md bg-white">
                                        <option>Spain</option>
                                        <option>Mexico</option>
                                        <option>United States</option>
                                        <option>Germany</option>
                                    </select>
                                </div> */}
                            </form>
                        </div>
                        {/* <!-- Localization & Preferences --> */}
                        <div className="bento-card">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                                <div>
                                    <label className="block text-body-sm font-bold mb-xs">Interface Language</label>
                                    <select 
                                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                      value={language}
                                      onChange={(e) => {
                                        const newLanguage = e.target.value as "Spanish (Español)" | "English (UK)"| "English (US)" | "French (Français)"
                                        setLanguage(newLanguage)
                                      }}
                                      >
                                        <option value="Spanish (Español)">Spanish (Español)</option>
                                        <option value="English (UK)">English (UK)</option>
                                        <option value="English (US)">English (US)</option>
                                        <option value="French (Français)">French (Français)</option>
                                    </select>
                                </div>
                                
                            </div>
                        </div>
                        {/* <!-- Actions --> */}
                        <div className="flex items-center justify-end gap-md pt-md">
                            <button 
                              className="px-lg py-sm border border-outline-variant bg-white text-on-surface font-bold rounded-lg hover:bg-surface-container transition-colors text-body-md"  
                              onClick={handeEditeProfile}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-lg py-sm bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 hover:bg-white transform active:scale-95 transition-all text-body-md"
                                onClick={() => handleEditProfile({ name, email, phoneNumber, street, houseNumber, city, country, language })}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  )
}
