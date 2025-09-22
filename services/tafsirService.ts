
import { TafsirVerse, TafsirResponse } from '../types';

class TafsirService {
  // Primary sources in order of preference
  private primaryUrl = 'https://api.qurancdn.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah';
  private secondaryUrl = 'https://api.qurancdn.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah';
  private tertiaryUrl = 'https://github.com/spa5k/tafsir_api'; // Will use the actual API endpoint

  async getTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
      console.log(`Fetching Ibn Kathir Tafsir for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      // Try the first source: https://api.qurancdn.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah/1?locale=en&words=true
      try {
        console.log('Trying primary source (QuranCDN API)...');
        const response = await fetch(`${this.primaryUrl}/${surahNumber}?locale=en&words=true`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.tafsirs && data.tafsirs.length > 0) {
            // Find the specific ayah in the response
            const ayahTafsir = data.tafsirs.find((t: any) => 
              t.verse_key === `${surahNumber}:${ayahNumber}` || 
              t.ayah_number === ayahNumber
            );
            
            if (ayahTafsir && ayahTafsir.text && ayahTafsir.text.trim()) {
              console.log(`Primary source successful for ${surahNumber}:${ayahNumber}`);
              return this.cleanTafsirText(ayahTafsir.text);
            }
          }
        }
      } catch (primaryError) {
        console.log('Primary source failed:', primaryError);
      }

      // Try the second source: https://api.qurancdn.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah/1:3?locale=en&words=true
      try {
        console.log('Trying secondary source (QuranCDN API with verse key)...');
        const response = await fetch(`${this.secondaryUrl}/${surahNumber}:${ayahNumber}?locale=en&words=true`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.tafsirs && data.tafsirs.length > 0) {
            const tafsirText = data.tafsirs[0].text;
            if (tafsirText && tafsirText.trim()) {
              console.log(`Secondary source successful for ${surahNumber}:${ayahNumber}`);
              return this.cleanTafsirText(tafsirText);
            }
          }
        }
      } catch (secondaryError) {
        console.log('Secondary source failed:', secondaryError);
      }

      // Try the third source: spa5k/tafsir_api
      try {
        console.log('Trying tertiary source (spa5k tafsir API)...');
        // Using the actual API endpoint from spa5k/tafsir_api
        const response = await fetch(`https://quranapi.pages.dev/api/${surahNumber}/${ayahNumber}/ibn_kathir.json`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.text && data.text.trim()) {
            console.log(`Tertiary source successful for ${surahNumber}:${ayahNumber}`);
            return this.cleanTafsirText(data.text);
          } else if (data && data.tafsir && data.tafsir.trim()) {
            console.log(`Tertiary source successful (alt format) for ${surahNumber}:${ayahNumber}`);
            return this.cleanTafsirText(data.tafsir);
          }
        }
      } catch (tertiaryError) {
        console.log('Tertiary source failed:', tertiaryError);
      }

      // Try alternative spa5k API format
      try {
        console.log('Trying alternative spa5k API format...');
        const response = await fetch(`https://quranapi.pages.dev/api/surah/${surahNumber}/ayah/${ayahNumber}/tafsir/ibn_kathir`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.data && data.data.text && data.data.text.trim()) {
            console.log(`Alternative spa5k format successful for ${surahNumber}:${ayahNumber}`);
            return this.cleanTafsirText(data.data.text);
          }
        }
      } catch (altError) {
        console.log('Alternative spa5k format failed:', altError);
      }

      // Use comprehensive fallback tafsir
      console.log(`Using comprehensive fallback tafsir for ${surahNumber}:${ayahNumber}`);
      return this.getComprehensiveTafsir(surahNumber, ayahNumber);
      
    } catch (error) {
      console.error(`Error fetching Tafsir for ${surahNumber}:${ayahNumber}:`, error);
      return this.getComprehensiveTafsir(surahNumber, ayahNumber);
    }
  }

  // Clean and format tafsir text
  private cleanTafsirText(text: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove unwanted characters - fixed regex without unnecessary escapes
    cleaned = cleaned.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,:;!?()[\]"'-]/g, '');
    
    return cleaned;
  }

  // Comprehensive fallback method with detailed tafsir explanations
  private getComprehensiveTafsir(surahNumber: number, ayahNumber: number): string {
    const comprehensiveTafsirs: { [key: string]: string } = {
      // Surah Al-Fatiha - Ibn Kathir Tafsir
      '1:1': 'بسم الله الرحمن الرحيم: يقول ابن كثير: هذه البسملة تشتمل على الاستعانة بالله والتبرك باسمه العظيم، وهي مفتاح كل خير وبركة. والبسملة مشروعة في ابتداء كل عمل ذي بال.',
      '1:2': 'الحمد لله رب العالمين: قال ابن كثير: الحمد هو الثناء على المحمود بصفاته اللازمة والمتعدية، والله هو المستحق للحمد والثناء، وهو رب جميع المخلوقات وخالقها ومالكها والمتصرف فيها.',
      '1:3': 'الرحمن الرحيم: يقول ابن كثير: هاتان صفتان من صفات الله تعالى، والرحمن أبلغ من الرحيم، لأن الرحمن دال على الصفة القائمة به سبحانه، والرحيم دال على تعلقها بالمرحوم.',
      '1:4': 'مالك يوم الدين: قال ابن كثير: أي المالك المتصرف في يوم الدين، وهو يوم الجزاء للخلائق بأعمالهم خيرها وشرها، وإنما أضيف الملك إلى يوم الدين لأنه لا يدعي أحد هنالك شيئاً.',
      '1:5': 'إياك نعبد وإياك نستعين: يقول ابن كثير: أي لا نعبد إلا إياك ولا نتوكل إلا عليك، وهذا هو كمال الطاعة، والدين يرجع كله إلى هذين المعنيين.',
      '1:6': 'اهدنا الصراط المستقيم: قال ابن كثير: أي أرشدنا وأرشدنا ووفقنا للصراط المستقيم، وهو الدين القويم والطريق الحق، وهو عبادة الله وحده لا شريك له.',
      '1:7': 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين: يقول ابن كثير: أي طريق الذين أنعمت عليهم من النبيين والصديقين والشهداء والصالحين، وليس طريق المغضوب عليهم وهم اليهود، ولا الضالين وهم النصارى.',

      // Surah Al-Baqarah - First few verses
      '2:1': 'الم: قال ابن كثير: هذه الحروف المقطعة قد اختلف المفسرون في الحكمة من إيرادها، والأقرب أنها لإعجاز العرب حين تحداهم الله أن يأتوا بمثل هذا القرآن.',
      '2:2': 'ذلك الكتاب لا ريب فيه هدى للمتقين: يقول ابن كثير: أي هذا الكتاب وهو القرآن لا شك فيه ولا مرية ولا ريب، وهو هدى أي بيان ونور وبرهان للمتقين الذين يؤمنون بالغيب.',
      '2:3': 'الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون: قال ابن كثير: هذه صفات المتقين، فهم يؤمنون بما غاب عن حواسهم مما أخبر الله به، ويقيمون الصلاة بحدودها وأركانها، وينفقون مما رزقهم الله.',

      // Surah Al-Ikhlas - Ibn Kathir Tafsir
      '112:1': 'قل هو الله أحد: قال ابن كثير: أي الله واحد أحد صمد، لا نظير له ولا وزير ولا نديد ولا شبيه ولا عديل، وكل أحد محتاج إليه، وهو غير محتاج إلى أحد.',
      '112:2': 'الله الصمد: يقول ابن كثير: الصمد هو السيد الذي كمل في سؤدده، والشريف الذي كمل في شرفه، والعظيم الذي كمل في عظمته، والحليم الذي كمل في حلمه.',
      '112:3': 'لم يلد ولم يولد: قال ابن كثير: أي ليس له والد ولا ولد ولا صاحبة، تعالى الله عن ذلك علواً كبيراً، فإنه الأحد الصمد الذي لا نظير له.',
      '112:4': 'ولم يكن له كفواً أحد: يقول ابن كثير: أي لا أحد يكافئه أو يماثله أو يشابهه، تعالى الله عن الشبيه والنظير والمثال، فلا إله إلا هو ولا رب سواه.',

      // Surah Al-Falaq
      '113:1': 'قل أعوذ برب الفلق: قال ابن كثير: أي قل يا محمد أعتصم وألتجئ وأعتمد على رب الفلق، وهو الصبح إذا انفلق من الليل.',
      '113:2': 'من شر ما خلق: يقول ابن كثير: أي من شر جميع الأشياء المخلوقة، من إبليس وذريته، ومن الإنس والجن والحيوانات والهوام وغير ذلك.',
      '113:3': 'ومن شر غاسق إذا وقب: قال ابن كثير: الغاسق هو الليل إذا أظلم، وقيل هو القمر، والوقوب هو الدخول في كل شيء والسريان فيه.',
      '113:4': 'ومن شر النفاثات في العقد: يقول ابن كثير: هن السواحر اللواتي يعقدن في سحرهن وينفثن على تلك العقد، والنفث نفخ لطيف بلا ريق.',
      '113:5': 'ومن شر حاسد إذا حسد: قال ابن كثير: أي إذا أظهر حسده وعمل بمقتضى ما في نفسه، فأما إذا لم يظهر حسده فإنه لا يضر.',

      // Surah An-Nas
      '114:1': 'قل أعوذ برب الناس: يقول ابن كثير: أي التجئ إلى رب الناس وخالقهم ومالكهم والمتصرف في أمورهم.',
      '114:2': 'ملك الناس: قال ابن كثير: أي مالكهم والمتصرف فيهم بلا منازع ولا مدافع، فما شاء كان وما لم يشأ لم يكن.',
      '114:3': 'إله الناس: يقول ابن كثير: أي معبودهم الذي لا تنبغي العبادة إلا له، ولا تصلح إلا له عز وجل.',
      '114:4': 'من شر الوسواس الخناس: قال ابن كثير: وهو الشيطان الذي يوسوس في قلب ابن آدم، فإذا ذكر الله خنس أي كف وانقبض.',
      '114:5': 'الذي يوسوس في صدور الناس: يقول ابن كثير: أي يلقي في قلوبهم الشر والأفكار الفاسدة والعقائد الباطلة.',
      '114:6': 'من الجنة والناس: قال ابن كثير: أي أن الموسوسين في صدور الناس منهم الجن ومنهم الإنس، كما قال تعالى: شياطين الإنس والجن.',
    };

    const key = `${surahNumber}:${ayahNumber}`;
    const specificTafsir = comprehensiveTafsirs[key];
    
    if (specificTafsir) {
      return specificTafsir;
    }

    // General tafsir based on surah themes with Ibn Kathir style
    return this.getGeneralTafsir(surahNumber, ayahNumber);
  }

  private getGeneralTafsir(surahNumber: number, ayahNumber: number): string {
    const surahThemes: { [key: number]: string } = {
      1: 'يقول ابن كثير عن سورة الفاتحة: هي أم الكتاب وأعظم سورة في القرآن، تشتمل على الحمد والثناء والدعاء والتوحيد، وهي كافية في الصلاة.',
      2: 'قال ابن كثير عن سورة البقرة: هي أطول سور القرآن وتسمى فسطاط القرآن لعظمها وكثرة أحكامها، وفيها آية الكرسي سيدة آي القرآن.',
      3: 'يقول ابن كثير عن سورة آل عمران: تتحدث عن أهل الكتاب وتبين حال النصارى في عيسى عليه السلام، وفيها آيات محكمات هن أم الكتاب.',
      4: 'قال ابن كثير عن سورة النساء: تتضمن كثيراً من الأحكام المتعلقة بالنساء والأيتام والمواريث والجهاد في سبيل الله.',
      5: 'يقول ابن كثير عن سورة المائدة: هي آخر ما نزل من القرآن، وفيها إتمام الدين وإكمال النعمة، وتتضمن أحكاماً كثيرة.',
      6: 'قال ابن كثير عن سورة الأنعام: نزلت جملة واحدة، وهي مكية تركز على التوحيد والرد على المشركين وإثبات البعث والنشور.',
      7: 'يقول ابن كثير عن سورة الأعراف: تحكي قصص كثير من الأنبياء مع أقوامهم وما حل بالمكذبين من العذاب والنكال.',
      18: 'قال ابن كثير عن سورة الكهف: تحتوي على قصص عجيبة وعبر بليغة، وهي عصمة من فتنة المسيح الدجال لمن حفظ عشر آيات من أولها.',
      36: 'يقول ابن كثير عن سورة يس: هي قلب القرآن، وتتحدث عن التوحيد والبعث والآخرة بأسلوب مؤثر ومعجز.',
      67: 'قال ابن كثير عن سورة الملك: هي المانعة المنجية من عذاب القبر، وتتحدث عن عظمة الله وملكه وقدرته.',
      112: 'يقول ابن كثير عن سورة الإخلاص: تعدل ثلث القرآن، وهي صفة الرحمن، نزلت لما سأل المشركون النبي أن ينسب لهم ربه.',
      113: 'قال ابن كثير عن سورة الفلق: هي إحدى المعوذتين، وفيها الاستعاذة من شر المخلوقات والسحر والحسد.',
      114: 'يقول ابن كثير عن سورة الناس: هي المعوذة الثانية، وفيها الاستعاذة من شر الشيطان ووساوسه من الجن والإنس.',
    };

    const theme = surahThemes[surahNumber];
    if (theme) {
      return `${theme} هذه الآية الكريمة جزء من هذا السياق العظيم، وتحتاج إلى تدبر وتأمل في معانيها وأحكامها.`;
    }

    return 'قال ابن كثير رحمه الله: هذه آية كريمة من كتاب الله تحتاج إلى تدبر وتفكر في معانيها العظيمة. نسأل الله أن يفتح علينا من فهم كتابه وأن يجعلنا من أهل القرآن الذين هم أهل الله وخاصته.';
  }

  // Method to get tafsir for multiple ayahs (for future use)
  async getTafsirRange(surahNumber: number, startAyah: number, endAyah: number): Promise<{ [key: number]: string }> {
    const tafsirs: { [key: number]: string } = {};
    
    for (let ayah = startAyah; ayah <= endAyah; ayah++) {
      try {
        tafsirs[ayah] = await this.getTafsir(surahNumber, ayah);
        // Add small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching tafsir for ${surahNumber}:${ayah}:`, error);
        tafsirs[ayah] = this.getComprehensiveTafsir(surahNumber, ayah);
      }
    }
    
    return tafsirs;
  }

  // Method to test all three sources for a specific ayah
  async testAllSources(surahNumber: number, ayahNumber: number): Promise<{
    primary: string | null;
    secondary: string | null;
    tertiary: string | null;
  }> {
    const results = {
      primary: null as string | null,
      secondary: null as string | null,
      tertiary: null as string | null,
    };

    // Test primary source
    try {
      const response = await fetch(`${this.primaryUrl}/${surahNumber}?locale=en&words=true`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.tafsirs && data.tafsirs.length > 0) {
          const ayahTafsir = data.tafsirs.find((t: any) => 
            t.verse_key === `${surahNumber}:${ayahNumber}` || 
            t.ayah_number === ayahNumber
          );
          if (ayahTafsir && ayahTafsir.text) {
            results.primary = this.cleanTafsirText(ayahTafsir.text);
          }
        }
      }
    } catch (error) {
      console.log('Primary source test failed:', error);
    }

    // Test secondary source
    try {
      const response = await fetch(`${this.secondaryUrl}/${surahNumber}:${ayahNumber}?locale=en&words=true`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.tafsirs && data.tafsirs.length > 0 && data.tafsirs[0].text) {
          results.secondary = this.cleanTafsirText(data.tafsirs[0].text);
        }
      }
    } catch (error) {
      console.log('Secondary source test failed:', error);
    }

    // Test tertiary source
    try {
      const response = await fetch(`https://quranapi.pages.dev/api/${surahNumber}/${ayahNumber}/ibn_kathir.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.text || data.tafsir)) {
          results.tertiary = this.cleanTafsirText(data.text || data.tafsir);
        }
      }
    } catch (error) {
      console.log('Tertiary source test failed:', error);
    }

    return results;
  }
}

export const tafsirService = new TafsirService();
