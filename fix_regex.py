import re
import os

file1 = "src/components/shared/booking-modal.tsx"
with open(file1, "r") as f:
    content = f.read()

# Fix import
content = re.sub(
    r'import \{\s*Dialog,\s*DialogContent\s*\} from "@/components/ui/dialog";',
    'import {\n Dialog,\n DialogContent,\n DialogTitle\n} from "@/components/ui/dialog";',
    content
)

# Fix DialogTitle insertion
content = re.sub(
    r'(<DialogContent className="sm:max-w-\[650px\] p-0 overflow-hidden border-0 bg-transparent shadow-none">)(\s*)(<GlassCard)',
    r'\1\2<DialogTitle className="sr-only">{mode === \'reschedule\' ? \'Reschedule Appointment\' : \'Book Appointment\'}</DialogTitle>\2\3',
    content
)

# Fix empty slots message
content = re.sub(
    r'\) : \(\s*<p className="text-sm font-bold text-foreground/40 text-center italic py-4">Please select a date first</p>\s*\)\}',
    ') : bookingState.date ? (\n                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">No available time slots for the selected date.</p>\n              ) : (\n                <p className="text-sm font-bold text-foreground/40 text-center italic py-4">Please select a date first</p>\n              )}',
    content
)

with open(file1, "w") as f:
    f.write(content)

file2 = "src/app/service/[id]/page.tsx"
with open(file2, "r") as f:
    content2 = f.read()

# Fix buttons
content2 = re.sub(
    r'<Button variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">',
    '<Button onClick={() => setIsBookingModalOpen(true)} variant="outline" className="w-full h-12 rounded-xl border-glass-border font-bold text-primary justify-start hover:bg-primary/5 ">',
    content2
)

with open(file2, "w") as f:
    f.write(content2)

print("Regex Done")
