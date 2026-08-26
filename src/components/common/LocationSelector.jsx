import { useState, useEffect, useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import { Globe, MapPin, Building2 } from 'lucide-react'

export default function LocationSelector({
  country = '',
  state = '',
  city = '',
  onChange,
  disabled = false,
  required = false,
  layout = 'row', // 'row' | 'col' | 'grid-2'
  className = '',
}) {
  const allCountries = useMemo(() => Country.getAllCountries(), [])

  // Find matching initial country object
  const initialCountryObj = useMemo(() => {
    if (!country) return null
    return (
      allCountries.find(
        (c) =>
          c.name.toLowerCase() === country.toLowerCase() ||
          c.isoCode.toLowerCase() === country.toLowerCase()
      ) || null
    )
  }, [allCountries, country])

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    initialCountryObj?.isoCode || ''
  )

  // Get states for selected country
  const statesOfCountry = useMemo(() => {
    if (!selectedCountryCode) return []
    return State.getStatesOfCountry(selectedCountryCode)
  }, [selectedCountryCode])

  // Find matching initial state object
  const initialStateObj = useMemo(() => {
    if (!state || !statesOfCountry.length) return null
    return (
      statesOfCountry.find(
        (s) =>
          s.name.toLowerCase() === state.toLowerCase() ||
          s.isoCode.toLowerCase() === state.toLowerCase()
      ) || null
    )
  }, [statesOfCountry, state])

  const [selectedStateCode, setSelectedStateCode] = useState(
    initialStateObj?.isoCode || ''
  )
  const [selectedCity, setSelectedCity] = useState(city || '')

  // Keep internal state in sync with prop changes
  useEffect(() => {
    if (initialCountryObj && initialCountryObj.isoCode !== selectedCountryCode) {
      setSelectedCountryCode(initialCountryObj.isoCode)
    }
  }, [initialCountryObj])

  useEffect(() => {
    if (initialStateObj && initialStateObj.isoCode !== selectedStateCode) {
      setSelectedStateCode(initialStateObj.isoCode)
    }
  }, [initialStateObj])

  useEffect(() => {
    if (city !== selectedCity) {
      setSelectedCity(city || '')
    }
  }, [city])

  // Get cities for selected country & state
  const citiesOfState = useMemo(() => {
    if (!selectedCountryCode || !selectedStateCode) return []
    return City.getCitiesOfState(selectedCountryCode, selectedStateCode)
  }, [selectedCountryCode, selectedStateCode])

  // Handle Country change
  const handleCountryChange = (e) => {
    const code = e.target.value
    setSelectedCountryCode(code)
    setSelectedStateCode('')
    setSelectedCity('')

    const countryObj = allCountries.find((c) => c.isoCode === code)
    if (onChange) {
      onChange({
        country: countryObj?.name || '',
        countryCode: code,
        state: '',
        stateCode: '',
        city: '',
      })
    }
  }

  // Handle State change
  const handleStateChange = (e) => {
    const code = e.target.value
    setSelectedStateCode(code)
    setSelectedCity('')

    const countryObj = allCountries.find((c) => c.isoCode === selectedCountryCode)
    const stateObj = statesOfCountry.find((s) => s.isoCode === code)

    if (onChange) {
      onChange({
        country: countryObj?.name || '',
        countryCode: selectedCountryCode,
        state: stateObj?.name || '',
        stateCode: code,
        city: '',
      })
    }
  }

  // Handle City change
  const handleCityChange = (e) => {
    const cityName = e.target.value
    setSelectedCity(cityName)

    const countryObj = allCountries.find((c) => c.isoCode === selectedCountryCode)
    const stateObj = statesOfCountry.find((s) => s.isoCode === selectedStateCode)

    if (onChange) {
      onChange({
        country: countryObj?.name || '',
        countryCode: selectedCountryCode,
        state: stateObj?.name || '',
        stateCode: selectedStateCode,
        city: cityName,
      })
    }
  }

  const containerClass =
    layout === 'row'
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-3'
      : layout === 'grid-2'
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
      : 'space-y-3'

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Country Select */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Globe size={13} className="text-indigo-600" />
          Country {required && <span className="text-rose-500">*</span>}
        </label>
        <select
          value={selectedCountryCode}
          onChange={handleCountryChange}
          disabled={disabled}
          required={required}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">Select Country</option>
          {allCountries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.flag ? `${c.flag} ` : ''}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* State / Province Select */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <MapPin size={13} className="text-indigo-600" />
          State / Province {required && <span className="text-rose-500">*</span>}
        </label>
        {statesOfCountry.length > 0 ? (
          <select
            value={selectedStateCode}
            onChange={handleStateChange}
            disabled={disabled || !selectedCountryCode}
            required={required}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {!selectedCountryCode ? 'Select Country First' : 'Select State / Region'}
            </option>
            {statesOfCountry.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder={
              !selectedCountryCode ? 'Select Country First' : 'Enter State / Region'
            }
            value={state}
            onChange={(e) => {
              const countryObj = allCountries.find(
                (c) => c.isoCode === selectedCountryCode
              )
              if (onChange) {
                onChange({
                  country: countryObj?.name || '',
                  countryCode: selectedCountryCode,
                  state: e.target.value,
                  stateCode: '',
                  city: selectedCity,
                })
              }
            }}
            disabled={disabled || !selectedCountryCode}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
          />
        )}
      </div>

      {/* City Select / Input */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Building2 size={13} className="text-indigo-600" />
          City {required && <span className="text-rose-500">*</span>}
        </label>
        {citiesOfState.length > 0 ? (
          <select
            value={selectedCity}
            onChange={handleCityChange}
            disabled={disabled || !selectedStateCode}
            required={required}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {!selectedStateCode ? 'Select State First' : 'Select City'}
            </option>
            {citiesOfState.map((ct, idx) => (
              <option key={`${ct.name}-${idx}`} value={ct.name}>
                {ct.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder={
              !selectedCountryCode
                ? 'Select Country & State First'
                : 'Enter City Name'
            }
            value={selectedCity}
            onChange={handleCityChange}
            disabled={disabled || !selectedCountryCode}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
          />
        )}
      </div>
    </div>
  )
}
