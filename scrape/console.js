(async function () {
  const START = 2003974;
  const END = 2097312;
  let shouldStop = false;
  const failedSBDs = [];

  // UI STOP BUTTON
  const stopBtn = document.createElement("button");
  stopBtn.textContent = "🛑 STOP scraping";
  Object.assign(stopBtn.style, {
    position: "fixed", top: "20px", right: "20px",
    padding: "10px 15px", backgroundColor: "red",
    color: "white", fontSize: "16px", zIndex: 9999
  });
  stopBtn.onclick = () => {
    shouldStop = true;
    alert("⏹️ Scraper will stop after current SBD.");
  };
  document.body.appendChild(stopBtn);

  // Helper Functions
  function saveProgress(sbd) {
    localStorage.setItem("lastSBD", sbd.toString());
  }

  function getResumeStart() {
    const last = localStorage.getItem("lastSBD");
    return last ? parseInt(last) : START;
  }

  function saveResults(results) {
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem("allResults") || "[]");
    } catch {}
    const merged = [...existing, ...results];
    const deduped = Array.from(new Map(merged.map(r => [r[0], r])).values());
    localStorage.setItem("allResults", JSON.stringify(deduped));
    return deduped;
  }

  function downloadCSV(content, filename = "diem_thi.csv") {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadTXT(lines, filename = "failed_sbd.txt") {
    const blob = new Blob([lines.join("\n")], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function parseSubjects(subjectString) {
    const subjects = {
      "Ngữ văn": "", "Toán": "",
      "Tiếng Anh": "", "Tiếng Pháp": "", "Tiếng Trung": "", "Tiếng Nhật": "", "Tiếng Đức": "", "Tiếng Nga": "",
      "Lịch sử": "", "Vật lí": "", "Hóa học": "", "Sinh học": "", "Địa lí": "",
      "Giáo dục Kinh tế và Pháp luật": "", "Tin học": "",
      "Công nghệ Công nghiệp": "", "Công nghệ Nông nghiệp": "",
    };

    const abbreviationMap = {
      "TI": "Tin học",
      "KTPL": "Giáo dục Kinh tế và Pháp luật",
      "CNCN": "Công nghệ Công nghiệp",
      "CNNN": "Công nghệ Nông nghiệp",
    };

    const programMatch = subjectString.match(/\((.*?)\)$/);
    const program = programMatch ? programMatch[1] : "";
    const subjectClean = subjectString.replace(/\(.*?\)$/, "").trim();

    const regex = /([^\:]+):\s*([0-9.]+)/g;
    let match;
    while ((match = regex.exec(subjectClean)) !== null) {
      let name = match[1].trim();
      const score = match[2];

      if (abbreviationMap[name]) name = abbreviationMap[name];
      if (subjects.hasOwnProperty(name)) {
        subjects[name] = score;
      } else if (/^Tiếng (Anh|Pháp|Trung|Nhật|Đức|Nga)$/i.test(name)) {
        subjects[name] = score;
      }
    }

    return { subjects, program };
  }

  function toCSV(results) {
    const headers = [
      "SBD", "Tên", "Ngày sinh",
      "Ngữ văn", "Toán",
      "Tiếng Anh", "Tiếng Pháp", "Tiếng Trung", "Tiếng Nhật", "Tiếng Đức", "Tiếng Nga",
      "Lịch sử", "Vật lí", "Hóa học", "Sinh học", "Địa lí",
      "Giáo dục Kinh tế và Pháp luật", "Tin học", "Công nghệ Công nghiệp", "Công nghệ Nông nghiệp",
      "Chương trình"
    ];
    const lines = [headers.join(",")];

    for (const row of results) {
      const [sbd, name, dob, subjectRaw] = row;
      const { subjects, program } = parseSubjects(subjectRaw);

      const csvRow = [
        sbd,
        `"${name}"`,
        dob,
        subjects["Ngữ văn"],
        subjects["Toán"],
        subjects["Tiếng Anh"],
        subjects["Tiếng Pháp"],
        subjects["Tiếng Trung"],
        subjects["Tiếng Nhật"],
        subjects["Tiếng Đức"],
        subjects["Tiếng Nga"],
        subjects["Lịch sử"],
        subjects["Vật lí"],
        subjects["Hóa học"],
        subjects["Sinh học"],
        subjects["Địa lí"],
        subjects["Giáo dục Kinh tế và Pháp luật"],
        subjects["Tin học"],
        subjects["Công nghệ Công nghiệp"],
        subjects["Công nghệ Nông nghiệp"],
        program
      ];

      lines.push(csvRow.join(","));
    }

    return lines.join("\n");
  }

  const results = [];
  const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
  if (!tokenInput) {
    alert("⚠️ Token not found. Make sure you're on https://diemthi.hcm.edu.vn/");
    return;
  }
  const token = tokenInput.value;

  for (let i = getResumeStart(); i <= END; i++) {
    if (shouldStop) {
      alert("🛑 Stopped by user. Saving progress...");
      break;
    }

    const sbd = i.toString().padStart(8, '0');
    let attempt = 0;
    let success = false;

    while (attempt < 3 && !success) {
      attempt++;

      try {
        const response = await fetch("https://diemthi.hcm.edu.vn/Home/Show", {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: `__RequestVerificationToken=${encodeURIComponent(token)}&SoBaoDanh=${sbd}`,
          method: "POST",
        });

        if (!response.ok) throw new Error("Non-200 response");

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const rows = doc.querySelectorAll("table tr");
        if (rows.length < 2) {
          console.log(`🚫 No data for SBD ${sbd}`);
          break;
        }

        const cells = rows[1].querySelectorAll("td");
        if (cells.length < 3) break;

        const name = cells[0].innerText.trim();
        const dob = cells[1].innerText.trim();
        const subjectsText = cells[2].innerText.trim();

        results.push([sbd, name, dob, subjectsText]);
        console.log(`✅ SBD ${sbd}`);
        success = true;
        saveProgress(i); // only after success
      } catch (err) {
        console.warn(`⚠️ SBD ${sbd} failed (attempt ${attempt}): ${err.message}`);
        if (attempt >= 3) {
          failedSBDs.push(sbd);
          const merged = saveResults(results);
          const partialCSV = toCSV(merged);
          downloadCSV(partialCSV, `partial_until_${sbd}.csv`);
          downloadTXT(failedSBDs, "failed_sbd.txt");
          alert(`❌ Timed out at SBD ${sbd}. Partial file and failed SBDs saved.`);
          return;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    await new Promise(r => setTimeout(r, 50));
  }

  const final = saveResults(results);
  const csv = toCSV(final);
  downloadCSV(csv);
  if (failedSBDs.length > 0) {
    downloadTXT(failedSBDs, "failed_sbd.txt");
  }
  alert("🎉 Scraping completed!");
  console.log("✅ All done!");
})();
