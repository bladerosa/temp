import type { Schedule, TimeUnit } from '../data/types';

export function ScheduleEditor({
  value, onChange,
}: { value: Schedule; onChange: (next: Schedule) => void }) {
  const setUnit = (unit: TimeUnit) => {
    onChange({ ...value, unit });
  };

  return (
    <div className="picker-block">
      <div className="schedule-grid">
        <div className="lbl">每隔</div>
        <div className="row gap-8">
          <input
            type="number" min={1}
            className="input" style={{ width: 90 }}
            value={value.every}
            onChange={(e) => onChange({ ...value, every: Math.max(1, Number(e.target.value) || 1) })}
          />
          <select className="select" style={{ width: 110 }} value={value.unit} onChange={(e) => setUnit(e.target.value as TimeUnit)}>
            <option value="minute">分钟</option>
            <option value="hour">小时</option>
            <option value="day">天</option>
          </select>
          <span className="muted" style={{ fontSize: 12 }}>执行一次</span>
        </div>

        <div className="lbl">执行时刻</div>
        <input
          type="time"
          className="input" style={{ width: 140 }}
          value={value.anchorTime}
          onChange={(e) => onChange({ ...value, anchorTime: e.target.value })}
        />
      </div>
      <div className="hint mt-12 muted" style={{ fontSize: 12 }}>
        定时任务以「执行时刻」对齐到具体时间点，并按所选周期循环执行。
      </div>
    </div>
  );
}
