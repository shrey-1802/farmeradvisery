import { Injectable, Logger } from '@nestjs/common';
import { IAdvisoryInput, IAdvisoryOutput } from './advisory.types';

@Injectable()
export class AdvisoryRuleEngine {
  private readonly logger = new Logger(AdvisoryRuleEngine.name);

  generateAdvisory(input: IAdvisoryInput): IAdvisoryOutput[] {
    const { farmProfile, currentWeather, forecastWeather, language = 'en' } = input;
    const advisories: IAdvisoryOutput[] = [];

    const rain = currentWeather.rainfallMm;
    const temp = currentWeather.temperatureC;
    const humidity = currentWeather.humidityPct;
    const wind = currentWeather.windSpeedKmh;

    // Rule 1: Heavy Rainfall Alert (rain > 15mm or forecast rain > 30mm)
    const heavyRainForecast = forecastWeather?.dailyForecast?.some((f) => f.precipitationMm > 25);
    if (rain > 15 || heavyRainForecast) {
      advisories.push(this.getRainfallAdvisory(language, farmProfile.cropName || 'Crop', Math.max(rain, 30)));
    }

    // Rule 2: High Temperature & Heat Stress (temp > 37°C)
    if (temp > 37) {
      advisories.push(this.getHeatStressAdvisory(language, farmProfile.waterSource, temp));
    }

    // Rule 3: High Humidity Fungal Disease Risk (humidity > 75% & temp between 20-32°C)
    if (humidity > 75 && temp >= 20 && temp <= 32) {
      advisories.push(this.getFungalRiskAdvisory(language, farmProfile.cropName || 'Crop', humidity));
    }

    // Rule 4: High Wind Speed Warning (wind > 25 km/h)
    if (wind > 25) {
      advisories.push(this.getWindWarningAdvisory(language, wind));
    }

    // Rule 5: Default General Good Agricultural Practice Advisory if no severe alert triggered
    if (advisories.length === 0) {
      advisories.push(this.getGeneralAdvisory(language, farmProfile.cropName || 'Crop'));
    }

    return advisories;
  }

  private getRainfallAdvisory(lang: string, cropName: string, rainMm: number): IAdvisoryOutput {
    const translations: Record<string, any> = {
      en: {
        title: 'Heavy Rainfall & Waterlogging Alert',
        message: `Heavy precipitation expected (${rainMm}mm). Excessive field water can damage root systems for ${cropName}.`,
        rec: [
          'Clear field drainage channels immediately to prevent standing water.',
          'Postpone all scheduled fertilizer applications until soil dries.',
        ],
        avoid: ['Do not apply chemical pesticide or fungicide sprays today as rain will wash them off.'],
        reason: 'Waterlogging causes root suffocation and nutrient leaching.',
      },
      hi: {
        title: 'भारी वर्षा और जलभराव चेतावनी',
        message: `आपके क्षेत्र में भारी बारिश (${rainMm}mm) का अनुमान है। अधिक जलभराव से ${cropName} की जड़ों को नुकसान पहुंच सकता है।`,
        rec: [
          'खेत से अतिरिक्त पानी निकालने के लिए जल निकासी की नालियों को तुरंत साफ करें।',
          'मिट्टी सूखने तक उर्वरक का छिड़काव स्थगित करें।',
        ],
        avoid: ['आज रासायनिक कीटनाशकों का छिड़काव न करें।'],
        reason: 'जलभराव से जड़ों में ऑक्सीजन की कमी हो जाती है।',
      },
      gu: {
        title: 'ભારે વરસાદ અને પાણી ભરાવાની ચેતવણી',
        message: `તમારા વિસ્તારમાં ભારે વરસાદ (${rainMm}mm) ની આગાહી છે. વધુ પાણી ભરાવાથી ${cropName} ના મૂળને નુકસાન થઈ શકે છે.`,
        rec: [
          'ખેતરમાંથી વધારાનું પાણી નિકાલ કરવા માટે નિકાલ ગટર તુરંત સાફ કરો.',
          'જમીન સુકાય નહીં ત્યાં સુધી ખાતર નાખવાનું બંધ રાખો.',
        ],
        avoid: ['આજે રસાયણિક દવાનો છંટકાવ કરશો નહીં.'],
        reason: 'વધુ પાણી ભરાવાથી મૂળ સરખી રીતે શ્વાસ લઈ શકતા નથી.',
      },
    };

    const t = translations[lang] || translations.en;
    return {
      type: 'weather_alert',
      title: t.title,
      message: t.message,
      language: lang,
      severity: 'HIGH',
      recommendedActions: t.rec,
      actionsToAvoid: t.avoid,
      reason: t.reason,
      validity: '24 Hours',
      source: 'Rule-Based Agronomic Decision Engine v1.0',
      disclaimer:
        'This advisory is for decision support only. Consult a registered field officer before applying chemical treatments.',
    };
  }

  private getHeatStressAdvisory(lang: string, waterSource: string, tempC: number): IAdvisoryOutput {
    const tEn = {
      title: 'High Temperature & Heat Stress Advisory',
      message: `Current temperature is high (${tempC}°C). Heat stress can reduce crop transpiration efficiency.`,
      rec: [
        `Provide light irrigation during early morning (5 AM - 8 AM) or evening hours using your ${waterSource} source.`,
        'Consider mulching using crop residue to retain soil moisture.',
      ],
      avoid: ['Do not irrigate during peak afternoon sunlight (12 PM - 3 PM) to prevent root thermal shock.'],
      reason: 'Afternoon irrigation causes rapid soil evaporation and thermal stress on tender plant tissue.',
    };

    return {
      type: 'heat_stress',
      title: tEn.title,
      message: tEn.message,
      language: lang,
      severity: 'MEDIUM',
      recommendedActions: tEn.rec,
      actionsToAvoid: tEn.avoid,
      reason: tEn.reason,
      validity: '48 Hours',
      source: 'Rule-Based Agronomic Decision Engine v1.0',
      disclaimer:
        'This advisory is for decision support only. Consult a registered field officer before applying chemical treatments.',
    };
  }

  private getFungalRiskAdvisory(lang: string, cropName: string, humidityPct: number): IAdvisoryOutput {
    return {
      type: 'pest_disease_risk',
      title: 'High Fungal Disease Risk Alert',
      message: `High relative humidity (${humidityPct}%) creates favorable microclimate conditions for fungal pathogen outbreaks in ${cropName}.`,
      language: lang,
      severity: 'HIGH',
      recommendedActions: [
        'Inspect the lower canopy and foliage regularly for leaf spots or fungal powdery mildew symptoms.',
        'Maintain proper row spacing to facilitate air circulation.',
      ],
      actionsToAvoid: ['Avoid excessive overhead sprinkler irrigation in the late evening.'],
      reason: 'Prolonged leaf wetness promotes rapid fungal spore germination.',
      validity: '72 Hours',
      source: 'Rule-Based Agronomic Decision Engine v1.0',
      disclaimer:
        'This advisory is for decision support only. Consult a registered field officer before applying chemical treatments.',
    };
  }

  private getWindWarningAdvisory(lang: string, windSpeed: number): IAdvisoryOutput {
    return {
      type: 'wind_warning',
      title: 'Strong Wind Velocity Warning',
      message: `High wind speed detected (${windSpeed} km/h). Strong winds increase crop lodging risk and pesticide drift.`,
      language: lang,
      severity: 'MEDIUM',
      recommendedActions: ['Provide physical propping/staking support for tall or fruiting crops.'],
      actionsToAvoid: ['Do not spray liquid pesticides or foliar feeds due to severe chemical wind drift.'],
      reason: 'Wind drift reduces chemical efficacy and risks environmental contamination.',
      validity: '24 Hours',
      source: 'Rule-Based Agronomic Decision Engine v1.0',
      disclaimer:
        'This advisory is for decision support only. Consult a registered field officer before applying chemical treatments.',
    };
  }

  private getGeneralAdvisory(lang: string, cropName: string): IAdvisoryOutput {
    return {
      type: 'general_advisory',
      title: 'Favorable Weather & Field Maintenance Advisory',
      message: `Weather conditions are currently favorable for ${cropName} growth.`,
      language: lang,
      severity: 'LOW',
      recommendedActions: [
        'Continue regular field monitoring and weed management.',
        'Ensure balanced fertilization per soil health card guidelines.',
      ],
      actionsToAvoid: ['Avoid over-irrigation to maintain optimal root zone aeration.'],
      reason: 'Favorable weather allows optimal plant photosynthesis and nutrient uptake.',
      validity: '7 Days',
      source: 'Rule-Based Agronomic Decision Engine v1.0',
      disclaimer:
        'This advisory is for decision support only. Consult a registered field officer before applying chemical treatments.',
    };
  }
}
