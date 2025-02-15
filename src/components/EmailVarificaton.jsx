import React, { useState, useEffect } from "react";
import mailSide from "../assets/images/mailside-image.png";
import BackArrow from "../assets/images/backarrow.png";
import Rside from "../assets/images/Rside.png";
import Lside from "../assets/images/Lside.png";
import AdjiLogo from "../assets/images/EdjiLogo.png";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Flag from "react-world-flags";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { useSearchParams } from 'react-router-dom';
const EmailVarification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email')
  // console.log();

  const languages = [
    { value: "en", label: "English", code: "GB" },
    { value: "fr", label: "French", code: "FR" },
    { value: "ru", label: "Russian", code: "RU" },
    { value: "ar", label: "Arabic", code: "AE" },
    { value: "he", label: "Hebrew", code: "IL" },
  ];

  const [otpCode, setOtpCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(30);
  const [mfaToken, setMfaToken] = useState("");
  const [oobCode, setOobCode] = useState("");

  useEffect(() => {
    const currentLanguage = i18n.language || "en";
    const defaultLang =
      languages.find((lang) => lang.value === currentLanguage) || languages[0];
    setSelectedLanguage(defaultLang);
    i18n.changeLanguage(defaultLang.value);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
    i18n.changeLanguage(selectedOption.value);
  };

  const validateCode = async () => {
    try {
      const res = await fetch("https://dev.edji.co/v1/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({
          grantType: "mfa_oob",
          mfaToken,
          oobCode,
          bindingCode: otpCode,
        }),
      });
      const data = await res.json();
      if (!data.accessToken) {
        setErrorMessage("Invalid code. Please try again.");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("expiresIn", data.expiresIn);
      navigate("/home");
    } catch (e) {
      console.log(e);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "4px 8px",
      width: "100%",
      backgroundColor: "#D6EBF2",
      alignItems: 'center',
      boxShadow: "none",
      margin: "0 auto",
      "&:hover": {
        borderColor: "#888",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      padding: "8px 12px",
      backgroundColor: state.isFocused ? "#e9ecef" : "#fff",
      color: "#333",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      color: "#495057",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#3B9EBE",
      "&:hover": {
        color: "#3B9EBE",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  return (
    <div className="h-screen lg:h-auto flex flex-col lg:flex-row lg:overflow-hidden sm:overflow-auto">
      <div className="lg:w-1/2 w-full p-4 lg:p-0 lg:overflow-visible">
        <div className="h-full">
          <div className="mt-5 lg:ml-[97px]">
            <a href="#">
              <img src={BackArrow} alt="Back" />
            </a>
          </div>
          <div className="flex justify-between">
            <div>
              <img src={Rside} alt="R Side" />
            </div>
            <div className="mt-10 ml-20">
              {/* Language Selector */}
              <div className="mt-4 w-full max-w-md">
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-2 text-center"
                >
                  {t("Select Language")}
                </label>
                <Select
                  id="language"
                  options={languages.map((lang) => ({
                    value: lang.value,
                    label: (
                      <div className="flex items-center">
                        <Flag
                          code={lang.code}
                          style={{ width: "20px", marginRight: "8px" }}
                        />
                        {lang.label}
                      </div>
                    ),
                  }))}
                  value={{
                    value: selectedLanguage.value,
                    label: (
                      <div className="flex items-center">
                        <Flag
                          code={selectedLanguage.code}
                          style={{ width: "20px", marginRight: "8px" }}
                        />
                        {selectedLanguage.label}
                      </div>
                    ),
                  }}
                  onChange={handleLanguageChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={customStyles}
                />
              </div>
            </div>
            <div className="relative ml-10">
              <img src={Lside} alt="L Side" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold my-1">{t("Verify it’s you")}</h1>
            <p className="text-gray-600 mb-6">
              {t("We have sent a verification code to the email")} <br />
              <span className="font-medium text-black">{userEmail}</span>
            </p>
          </div>
          <div className="lg:ml-[99px]">
            <input
              type="text"
              name="emailCode"
              placeholder={t("Input your code....")}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full lg:w-[514px] border border-blue-400 px-4 py-2 mt-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-sm text-gray-400 cursor-pointer my-3">
              {t("Didn’t get the code?")} <span className="font-medium text-black underline">{t("Resend")}</span>
            </p>
            <button
              type="submit"
              className="w-full lg:w-[514px] bg-gradient-to-r my-4 from-blue-500 to-green-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg"
              onClick={validateCode}
            >
              {t("Continue")}
            </button>
          </div>
          <div className="text-center">
            <a
              href="#"
              className="text-sm text-blue-500 underline my-10 py-10 font-semibold"
            >
              {t("Change authentication mode")}
            </a>
            <div>
              <img src={AdjiLogo} alt="Adji Logo" className="mx-auto pt-[4rem]" />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 w-full pt-4 pr-3 order-first lg:order-last lg:overflow-visible">
        <div className="h-full w-full">
          <img
            src={mailSide}
            alt="Decorative"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailVarification;
