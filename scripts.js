document.addEventListener("DOMContentLoaded", function() {
    const calendarContainer = document.getElementById('calendar');
    const startDate = new Date(2023, 8, 1); // 2023年9月1日
    const endDate = new Date(2024, 7, 31); // 2024年8月31日

    fetch('records.csv')
        .then(response => response.text())
        .then(csvData => {
            const events = parseCSV(csvData);
            generateCalendar(events);
        });

    function parseCSV(csvData) {
        const rows = csvData.trim().split("\n").slice(1); // 忽略第一行标题
        const events = {};

        rows.forEach(row => {
            const [date, type, time, range, reason, source] = row.split(",");
            if (!events[date]) events[date] = [];
            events[date].push({ type, time, range, reason, source });
        });

        return events;
    }

    function generateCalendar(events) {
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const monthRow = document.createElement('div');
            monthRow.classList.add('month-row');

            const monthLabel = document.createElement('div');
            monthLabel.classList.add('month-label');
            monthLabel.textContent = `${String(currentDate.getMonth() + 1).padStart(2, ' ')}月 `;
            monthRow.appendChild(monthLabel);

            while (currentDate.getDate() !== 1) {
                currentDate.setDate(1);
            }

            do {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day');

                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;

                dayElement.textContent = day;

                if (events[dateString]) {
                    let isPowerOutage = false;
                    let isWaterOutage = false;
                    let isImportant = false;
                    let eventInfoText = '';

                    events[dateString].forEach(event => {
                        if (event.type === "停电") isPowerOutage = true;
                        if (event.type === "停水") isWaterOutage = true;
                        if (event.type === "多发") isImportant = true;

                        eventInfoText += `<strong>${event.type}<br>${event.time}<br>${event.range}<br></strong>${event.reason}<br>${event.source}`;

                        // 获取range的第一个字
                        const rangeFirstChar = event.range.charAt(0);

                        // 创建表示第一个字的圆圈
                        const rangeCircle = document.createElement('div');
                        rangeCircle.classList.add('range-circle');
                        rangeCircle.textContent = rangeFirstChar;

                        // 把圆圈添加到日期方块
                        dayElement.appendChild(rangeCircle);
                    });

                    if (isImportant) {
                        dayElement.classList.add('outage', 'important');
                    } else if (isPowerOutage) {
                        dayElement.classList.add('outage', 'power');
                    } else if (isWaterOutage) {
                        dayElement.classList.add('outage', 'water');
                    }

                    const eventInfo = document.createElement('div');
                    eventInfo.classList.add('event-info');
                    eventInfo.innerHTML = eventInfoText;
                    dayElement.appendChild(eventInfo);
                }

                monthRow.appendChild(dayElement);

                currentDate.setDate(currentDate.getDate() + 1);
                currentDate.setHours(0, 0, 0, 0);
            } while (currentDate.getDate() !== 1 && currentDate.getMonth() === (parseInt(monthLabel.textContent) - 1));

            calendarContainer.appendChild(monthRow);
        }
    }
});
