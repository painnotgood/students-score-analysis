# Student Scores Analysis
This is the analysis of Ho Chi Minh City (HCMC) Students' Score in The 2025 Vietnam High School Graduation Test.

## Process
### Step 1: Scraping
Page: https://diemthi.hcm.edu.vn/

I scraped for several hours in two days: July 16 and July 17.

I successfully acquired all 96916 students from Ho Chi Minh City (before the merger) using a JavaScript code that you can execute in your browser's console.

**Features:**
- Save straight to a CSV file, friendly for the Vietnamese language
- STOP button to stop scraping
- Notification of current progress
- Scraped numbers will be saved and loaded the next time you continue scraping
- Retry three times before stopping due to a timeout
- List of failed IDs

**The CSV file includes:**
- SBD: Candidate's ID
- Tên: Full name of the candidate in Vietnamese
- Ngày sinh: Candidate's date of birth in dd/mm/yyyy format
- Subjects: Literature, Math, English, French, Chinese, Japanese, German, Russian, History, Physics, Chemistry, Biology, Geography, Economics and Law Education, Informatics/CS, Industry Technology, Agriculture Technology
- Chương trình: The program version in which they took the test (2018 version or 2006 version)

### Step 2: Analysis
Note: the analysis will not include foreign language subjects (except for English) as the Ministry of Education has not released the stats yet, and these subjects are really niche, only used for some specialzied majors.

As a leading city of Vietnam, most of Ho Chi Minh City's students generally perform better than students from other in the corresponding subject. The following stats are notable subjects which HCMC students performed significantly better or worse (>5% or <5%) than other students:
Stat: percentage of students who got higher score than the national median
- Math: 63.18%
- Literature: 55.81%
- English: 63.48%
- Economics-Law Education: 66.83%
- Informatics/CS: 66.90%
- Agriculture Technology: 44.86%

The distribution also shows that some subjects have drastic higher scores compared to other subjects, making the final scores somewhat unfair, despite having modified using percentile by the Ministry of Education. 
Ex: In HCMC, top 10% English students had the score of 7.75, while Chemistry is 8.5. While 0.75 seems small, but many popular majors use both (Math, Physics, Chem) and (Math, Physics, English) combination as final scores. This is extremely important, evident through HCMUS' admission score: Advanced Program in Computer Science (29.98), AI (29.78), Data Science and Stats (29.45). Physics, a closely relevant subject in admission scores to Chemistry, has the median of 7.0, compared to 5.75 of the latter. The stdev can also be taken into account. Full stats in the file.

Some new subjects that are conducted for the first time this year also shows a high-score trend: Econ Law Education has the median of 8.0. IT/CS: 7.25. Agriculture Tech has the median of 7.5, compared to Industry Tech with 5.85 (you can choose to specialize in Tech or Agriculture; some schools only offer one option). This further emphasizes unbalance in test difficulty of some subjects.


# Phân tích Điểm thi THPTQG 2025 của Thành phố Hồ Chí Minh (trước khi sáp nhập)

## Trình tự làm
### Bước 1: Cào dữ liệu
Trang web: https://diemthi.hcm.edu.vn/

Trong hai ngày 16/07 và 17/07, mình đã dành ra nhiều tiếng treo máy để cào hết dữ liệu từ trang web.

Mình đã thành công cào hết 96916 thí sinh của Thành phố Hồ Chí Minh sử dụng đoạn code JavaScript mà có thể sử dụng trong console của browser của bạn.
