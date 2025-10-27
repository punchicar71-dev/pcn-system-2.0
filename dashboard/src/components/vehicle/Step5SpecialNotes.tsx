'use client';

import { SpecialNotesData } from '@/types/vehicle-form.types';
import { Label } from '@/components/ui/label';

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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Special Notes</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tag Notes */}
        <div>
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
        <div>
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

        {/* Preview */}
        {(data.tagNotes || data.specialNotePrint) && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes Preview</h3>
            
            {data.tagNotes && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Tag Notes (Internal)</p>
                <div className="bg-white p-3 rounded border text-sm text-gray-700">
                  {data.tagNotes}
                </div>
              </div>
            )}

            {data.specialNotePrint && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Special Note for Print (Customer-facing)</p>
                <div className="bg-white p-3 rounded border text-sm text-gray-700">
                  {data.specialNotePrint}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
