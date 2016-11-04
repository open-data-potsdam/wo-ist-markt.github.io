//
// opening_hours_tablefy 1.0.0
//

// Generated at 2016-11-04 09:57:54 

/*
 * A day class containing opening ranges.
 */
function Day() {

    this.openingRanges = [];

    this.addOpeningRange = function(openingRange) {
        this.openingRanges.push(openingRange);
    };

    this.addOpeningRanges = function(openingRanges) {
        for (var i = 0; i < openingRanges.length; i++) {
            this.addOpeningRange(openingRanges[i]);
        }
    };

    /*
     * Returns the day name index of the first opening range object
     * or -1 if there is no opening range object.
     */
    this.getDayNameIndex = function() {
        return this.openingRanges === [] ? -1 : this.openingRanges[0].getDayNameIndex();
    };

    this.getFormattedRanges = function() {
        var out = "";
        for (var i = 0; i < this.openingRanges.length; i++) {
            var openingRange = this.openingRanges[i];
            out += openingRange.getFormattedRange();
            if (i < this.openingRanges.length - 1) {
                out += ", ";
            }
        }
        return out;
    };

}


if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.Day = Day;

/*
 * Formatter for an opening range.
 * The actually formatting is dispatched to the moment.js library.
 */
function OpeningRangeFormatter() {

    this.getRangeDelimiter = function() {
        return " - ";
    };

    this.formatDate = function(date) {
        return moment(date).format('HH:mm');
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.OpeningRangeFormatter = OpeningRangeFormatter;

/*
 * An opening range class containg a from and a till date.
 *
 * - openingRange: An openingRange object created by the opening_hours.js library.
 * - formatter: An OpeningRangeFormatter object.
 */
function OpeningRange(openingRange, formatter) {

    this.fromDate = openingRange[0];
    this.tillDate = openingRange[1];
    this.formatter = formatter;

    /*
     * Returns the index of associated with the day name.
     * The fromDate is used as a lookup source.
     * It is zero indexed with the 0th item pointing to Sunday.
     */
    this.getDayNameIndex = function() {
        return this.fromDate.getDay();
    };

    /*
     * Returns the name of the given day names
     * at the position of the index.
     *
     * - dayNames: Array of day names. Must be zero indexed, starting with Sunday.
     */
    this.getDayName = function(dayNames) {
        return dayNames[this.getDayNameIndex()];
    };

    this.getFormattedFrom = function() {
        return this.getFormatted(this.fromDate);
    };

    this.getFormattedTill = function() {
        return this.getFormatted(this.tillDate);
    };

    this.getFormattedRange = function() {
        return this.getFormattedFrom() +
        this.formatter.getRangeDelimiter() +
        this.getFormattedTill();
    };

    this.getFormatted = function(date) {
        return this.formatter.formatDate(date);
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.OpeningRange = OpeningRange;

/*
 * Creates an OpeningTimes object from the given string.
 * To parse the string opening_hours.js and moment.js are used.
 *
 * The OpeningTimes object can be one of the following:
 * - next opening date
 * - opening ranges
 * - undefined if no next opening date or ranges are available
 */
function OpeningTimes(openingHoursStrings) {

    this.openingHoursStrings = openingHoursStrings;
    this.openingTimes = undefined;

    this.getOpeningRanges = function() {
        if (this.openingTimes === undefined) {
            this.openingTimes = this.calculateOpeningTimes();
        }
        if (this.openingTimes !== undefined && this.openingTimes.hasOwnProperty('intervals')) {
            return this.openingTimes.intervals;
        }
        return undefined;
    };

    this.getNextOpeningDate = function() {
        if (this.openingTimes === undefined) {
            this.openingTimes = this.calculateOpeningTimes();
        }
        if (this.openingTimes !== undefined && this.openingTimes.hasOwnProperty('nextChange')) {
            return this.openingTimes.nextChange;
        }
        return undefined;
    };

    /*
     * Returns opening times compiled via opening_hours.js.
     * Returns a object with the next opening date or opening ranges if available.
     * Returns undefined if no next opening date or ranges are available.
     */
    this.calculateOpeningTimes = function() {
        var sundayIndex = 0;
        var shiftBy;
        if (moment().weekday() === sundayIndex) {
            shiftBy = -1;
        } else {
            shiftBy = 1;
        }
        var monday = moment().startOf("week").add(shiftBy, 'days').toDate();
        var sunday = moment().endOf("week").add(shiftBy, 'days').toDate();
        var oh = new opening_hours(this.openingHoursStrings);
        var intervals = oh.getOpenIntervals(monday, sunday);
        var nextChange = oh.getNextChange();

        if (intervals.length > 0) {
            /* Return opening ranges */
            return {
                intervals: intervals
            };
        } else if (typeof nextChange !== 'undefined') {
            /* Return next opening date */
            return {
                nextChange: nextChange
            };
        } else {
            return undefined;
        }
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.OpeningTimes = OpeningTimes;

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.version = "1.0.0";

/*
 * Creates a Week object from the given opening ranges.
 * The opening ranges have to be extracted from an opening_hours.js object.
 */
function WeekGenerator() {

    this.getWeek = function(openingRanges) {
        var openingRangeFormatter = new OpeningRangeFormatter();
        var week = new Week();
        if (openingRanges === undefined) {
            return undefined;
        }
        for (var i = 0; i < openingRanges.length; ++i) {
            var openingRange = openingRanges[i];
            var day = new Day();
            var range = new OpeningRange(openingRange, openingRangeFormatter);
            day.addOpeningRange(range);
            week.addDay(day);
        }
        return week;
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.WeekGenerator = WeekGenerator;

/*
 * A week consisting of named days (Monday - Sunday).
 */
function Week() {

    this.monday = undefined;
    this.tuesday = undefined;
    this.wednesday = undefined;
    this.thursday = undefined;
    this.friday = undefined;
    this.saturday = undefined;
    this.sunday = undefined;

    this.FIELD_NAMES_ENGLISH = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    /*
     * Adds a Day object.
     * New and existing days which match by their name are merged.
     */
    this.addDay = function(specificDay) {
        var openingRanges = specificDay.openingRanges;
        for (var i = 0; i < openingRanges.length; i++) {
            var openingRange = openingRanges[i];
            // TODO Get rid of this order dependency.
            // The array must start with Sunday because Date.getDay() is zero indexed.
            var dayName = openingRange.getDayName(this.FIELD_NAMES_ENGLISH);
            if (dayName === "monday") {
                this.monday = this.getUpdatedDay(this.monday, specificDay);
            } else if (dayName === "tuesday") {
                this.tuesday = this.getUpdatedDay(this.tuesday, specificDay);
            } else if (dayName === "wednesday") {
                this.wednesday = this.getUpdatedDay(this.wednesday, specificDay);
            } else if (dayName === "thursday") {
                this.thursday = this.getUpdatedDay(this.thursday, specificDay);
            } else if (dayName === "friday") {
                this.friday = this.getUpdatedDay(this.friday, specificDay);
            } else if (dayName === "saturday") {
                this.saturday = this.getUpdatedDay(this.saturday, specificDay);
            } else if (dayName === "sunday") {
                this.sunday = this.getUpdatedDay(this.sunday, specificDay);
            }
        }
    };

    /*
     * Returns an array of days ordered from Monday to Sunday.
     * A day is only added to the array if it is defined.
     */
    this.getDays = function() {
        var days = [];
        if (this.monday !== undefined) {
            days.push(this.monday);
        }
        if (this.tuesday !== undefined) {
            days.push(this.tuesday);
        }
        if (this.wednesday !== undefined) {
            days.push(this.wednesday);
        }
        if (this.thursday !== undefined) {
            days.push(this.thursday);
        }
        if (this.friday !== undefined) {
            days.push(this.friday);
        }
        if (this.saturday !== undefined) {
            days.push(this.saturday);
        }
        if (this.sunday !== undefined) {
            days.push(this.sunday);
        }
        return days;
    };

    this.getUpdatedDay = function(day, specificDay) {
        if (day === undefined) {
            day = specificDay;
        } else {
            day.addOpeningRanges(specificDay.openingRanges);
        }
        return day;
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.Week = Week;

/*
 * An HTML generator for week data.
 * Outputs an HTML table with a row for each week day
 * which has corresponding opening hours.
 * If the day matches today the row is styled.
 *
 * - week: A Week object.
 * - today: A date object for now.
 * - dayNames: An array of day names to be shown in the table. Must be zero indexed, starting with Sunday.
 */
function WeekTableHtmlGenerator(week, today, dayNames) {

    this.week = week;
    this.today = today;
    this.dayNames = dayNames;

    this.getHtml = function() {
        var week = this.getWeek();
        return week.outerHTML;
    };

    this.getWeek = function() {
        var table = this.getTable();
        var days = this.week.getDays();
        for (var i = 0; i < days.length; i++) {
            var row = this.getDay(days[i]);
            table.appendChild(row);
        }
        return table;
    };

    this.getDay = function(day) {
        var row = this.getTableRow(day);
        var header = this.getDayNameCell(day);
        row.appendChild(header);
        var cell = this.getOpeningRangesCell(day);
        row.appendChild(cell);
        return row;
    };

    this.getTable = function() {
        var table = document.createElement("table");
        table.classList.add("times");
        return table;
    };

    this.getTableRow = function(day) {
        var row = document.createElement("tr");
        var dayNameIndex = day.getDayNameIndex();
        var dayIsToday = this.today.getDay() === dayNameIndex;
        if (dayIsToday) {
            row.classList.add("today");
        }
        return row;
    };

    this.getDayNameCell = function(day) {
        var header = document.createElement("th");
        var dayName = this.dayNames[day.getDayNameIndex()];
        var text = document.createTextNode(dayName);
        header.appendChild(text);
        return header;
    };

    this.getOpeningRangesCell = function(day) {
        var cell = document.createElement("td");
        var ranges = day.getFormattedRanges();
        var text = document.createTextNode(ranges + " Uhr");
        cell.appendChild(text);
        return cell;
    };

}

if (typeof window.ohhf === "undefined") {
    window.ohhf = {};
}
window.ohhf.WeekTableHtmlGenerator = WeekTableHtmlGenerator;

