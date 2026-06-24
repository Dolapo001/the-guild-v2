import os

file1 = "src/components/shared/booking-modal.tsx"
with open(file1, "r") as f:
    content = f.read()

content = content.replace(
"""import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";""",
"""import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";"""
)

content = content.replace(
"""<DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <GlassCard className="border-white/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white/80 backdrop-blur-2xl">""",
"""<DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">{mode === 'reschedule' ? 'Reschedule Appointment' : 'Book Appointment'}</DialogTitle>
          <GlassCard className="border-white/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white/80 backdrop-blur-2xl">"""
)

content = content.replace(
""") : (
                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">Please select a date first</p>
              )}""",
""") : bookingState.date ? (
                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">No available time slots for the selected date.</p>
              ) : (
                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">Please select a date first</p>
              )}"""
)

with open(file1, "w") as f:
    f.write(content)

file2 = "src/app/service/[id]/page.tsx"
with open(file2, "r") as f:
    content2 = f.read()

content2 = content2.replace(
"""<Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-40" /> Select Date
                        </Button>""",
"""<Button onClick={() => setIsBookingModalOpen(true)} variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-40" /> Select Date
                        </Button>"""
)

content2 = content2.replace(
"""<Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                          <Clock className="mr-2 h-4 w-4 opacity-40" /> Select Time
                        </Button>""",
"""<Button onClick={() => setIsBookingModalOpen(true)} variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">
                          <Clock className="mr-2 h-4 w-4 opacity-40" /> Select Time
                        </Button>"""
)

with open(file2, "w") as f:
    f.write(content2)

print("Done")
