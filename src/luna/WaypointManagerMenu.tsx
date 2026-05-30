import type { FlowSidebarItem } from '../flowSidebarItems'
import type { FlowStepId } from '../store/flowStore'

type WaypointManagerMenuProps = {
  items: FlowSidebarItem[]
  activeId: FlowStepId
  onSelect: (id: FlowStepId) => void
}

export function WaypointManagerMenu({
  items,
  activeId,
  onSelect,
}: WaypointManagerMenuProps) {
  return (
    <div className="navbar-manager-menu">
      <div className="wp-sidebar__preview">
        <div className="wp-sidebar__preview-chrome" aria-hidden="true">
          <span className="wp-sidebar__preview-chrome-line" />
          <span className="wp-sidebar__preview-chrome-line wp-sidebar__preview-chrome-line--right" />
        </div>
        <div className="wp-sidebar__preview-list">
          <div className="wp-sidebar__preview-steps">
            {items.map((card, index) => (
              <button
                key={card.id}
                type="button"
                className={`wp-sidebar__card${
                  card.id === activeId ? ' is-active' : ''
                }`}
                role="menuitem"
                aria-label={`${card.step}: ${card.title}`}
                aria-pressed={card.id === activeId}
                onClick={() => onSelect(card.id)}
              >
                <span
                  className="wp-sidebar__card-media"
                  style={{ backgroundColor: card.swatch }}
                >
                  {card.thumbUrl ? (
                    <span
                      className="wp-sidebar__thumb wp-sidebar__thumb--image"
                      aria-hidden
                    >
                      <img
                        src={card.thumbUrl}
                        alt=""
                        className="wp-sidebar__thumb-image"
                        draggable={false}
                      />
                    </span>
                  ) : (
                    <span className="wp-sidebar__thumb" aria-hidden>
                      <span className="wp-sidebar__thumb-index">{index + 1}</span>
                    </span>
                  )}
                </span>
                <span className="wp-sidebar__card-body">
                  <span className="wp-sidebar__card-step">{card.step}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
