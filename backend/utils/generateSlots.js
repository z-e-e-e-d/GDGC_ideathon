const moment = require("moment");

function generateSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  let current = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");

  while (current.isBefore(end)) {
    const next = current.clone().add(durationMinutes, "minutes");

    if (next.isAfter(end)) break;

    slots.push({
      time: `${current.format("HH:mm")} - ${next.format("HH:mm")}`,
    });

    current = next; // move to next slot
  }

  return slots;
}

module.exports = generateSlots;