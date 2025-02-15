import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import rightImage from "../../assets/images/right-image.png";
import logo from "../../assets/images/EdjiLogo.png";
import humanWelcome from "../../assets/images/mdi_human-welcome.png";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import Flag from "react-world-flags";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [authenticators, setAuthenticators] = useState("");

  const languages = [
    { value: "en", label: "English", code: "GB" },
    { value: "fr", label: "French", code: "FR" },
    { value: "ru", label: "Russian", code: "RU" },
    { value: "ar", label: "Arabic", code: "AE" },
    { value: "he", label: "Hebrew", code: "IL" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    const currentLanguage = i18n.language || "en";
    const defaultLang =
      languages.find((lang) => lang.value === currentLanguage) || languages[0];
    setSelectedLanguage(defaultLang);
    i18n.changeLanguage(defaultLang.value);
  }, []);

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
    i18n.changeLanguage(selectedOption.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(i18n.t("Please enter your email"));
      return;
    } else if (/\s/.test(email)) {
      setError(i18n.t("Email should not contain spaces!"));
      return;
    } else if (!/^[^@]+@[^\s]+$/.test(email)) {
      setError(i18n.t("Please enter a valid email address!"));
      return;
    }
    try {
      const res = await fetch("https://dev.edji.co/v1/auth/token", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          grantType: "password",
          userName: email,
        }),
      });
      const data = await res.json();
      if (data.error === "mfa_required") {
        setMfaToken(data.mfaToken);
        const authenticatorsRes = await fetch(
          "https://dev.edji.co/v1/mfa/authenticators",
          {
            method: "GET",
            headers: {
              "Content-Type": "Application/JSON",
              Authorization: `Bearer ${data.mfaToken}`,
            },
          }
        );
        const authenticatorsData = await authenticatorsRes.json();
        if (authenticatorsRes.ok) {
          if (authenticatorsData && authenticatorsData.length > 0) {
            setAuthenticators(authenticatorsData);
            const defaultAuthenticator = authenticatorsData.find(
              (auth) => auth.active
            );
            if (defaultAuthenticator) {
              await postMfaChallenge(defaultAuthenticator.id, data.mfaToken);
            } else {
              setError("No active authenticators found.");
            }
          } else {
            setError("No authenticators available.");
          }
        } else {
          setError("Failed to fetch Authenticators!");
        }
      } else {
        setError("Unexpected error during login.");
      }
    } catch (error) {
      setError("Network error or server error. Please try again.");
    }
  };

  const postMfaChallenge = async (authenticatorId, mfaToken) => {
    try {
      const res = await fetch("https://dev.edji.co/v1/mfa/challenge?lang=heb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({
          challengeType: "oob",
          authenticatorId,
          mfaToken,
        }),
      });
      const data = await res.json();
      const authcode = data.oobCode;
      localStorage.setItem("mfaToken", mfaToken);
      localStorage.setItem("oobCode", authcode);
      if (res.ok) {
        navigate(`/emailverification?email=${email}`);
      } else {
        const errorData = await res.json();
        setError("Failed to post MFA challenge.");
      }
    } catch (error) {
      setError("Error in MFA Challenge.");
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "4px 8px",
      width: "40%",
      backgroundColor: "#D6EBF2",
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
    <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden">
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center mt-9">
        <img src={logo} alt="Logo" className="mb-6 w-39" />
        <div className="flex items-center justify-center">
          <div
            style={{
              fontFamily: "Lato",
              fontWeight: "700",
              fontSize: "32px",
              lineHeight: "38.4px",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            {t("Welcome to Edji")}
          </div>
          <img
            src={humanWelcome}
            alt="Human Welcome"
            style={{
              width: "30px",
              height: "30px",
              marginLeft: "8px",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: "Lato",
            fontWeight: "400",
            fontSize: "18px",
            lineHeight: "21.6px",
            color: "rgba(0, 0, 0, 0.5)",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          {t("We are happy to see you here!")}
        </div>

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

        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="flex justify-center text-sm font-medium text-gray-700 my-6"
          >
            {t("Please enter your email to proceed")}
          </label>
          <div className="relative mb-4">
            <span>{t("Email")}</span>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Zakholiver@gmail.com"
              value={email}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 ${
                error ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg"
          >
            {t("Continue")}
          </button>
        </form>
      </div>
      <div className="w-full md:w-1/2 flex-shrink-0">
        <img
          src={rightImage}
          alt="Decorative"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default Login;