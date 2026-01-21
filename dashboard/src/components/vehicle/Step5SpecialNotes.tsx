'use client';

import { SpecialNotesData } from '@/types/vehicle-form.types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Step5SpecialNotesProps {
  data: SpecialNotesData;
  onChange: (data: Partial<SpecialNotesData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step5SpecialNotes({ data, onChange, onNext, onBack }: Step5SpecialNotesProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-slate-50 px-6 pt-6 pb-0">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Special Notes</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tag Notes */}
        <div className='max-w-7xl'>
          <Label htmlFor="tagNotes">Tag Notes</Label>
          <p className="text-sm text-gray-500 mb-2">
            Add brief notes about the vehicle (visible internally)
          </p>
          <textarea
            id="tagNotes"
            value={data.tagNotes}
            onChange={(e) => onChange({ tagNotes: e.target.value })}
            placeholder="Placeholder"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.tagNotes.length} characters
          </p>
        </div>

        {/* Special Note for Print */}
        <div className='max-w-7xl'>
          <Label htmlFor="specialNotePrint">Special Not for print</Label>
          <p className="text-sm text-gray-500 mb-2">
            Add detailed description for printing (visible to customers)
          </p>
          <textarea
            id="specialNotePrint"
            value={data.specialNotePrint}
            onChange={(e) => onChange({ specialNotePrint: e.target.value })}
            placeholder="Placeholder"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.specialNotePrint.length} characters
          </p>
        </div>

        {/* Navigation Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t py-4 px-6 -mx-6 mt-6">
          <div className="flex justify-start gap-4">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className='px-6 py-2'
            >
              Back
            </Button>
            <Button
              type="submit"
              className='px-6 py-2'
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
