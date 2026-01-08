// CustomNode.jsx - COMPACT VERSION
import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, selected }) => {
    // Get node properties
    const shape = data.shape || 'circle';
    const label = data.label || 'Node';
    const color = data.color || (shape === 'circle' ? '#4299e1' : '#48bb78');
    const bgColor = data.bgColor || (shape === 'circle' ? '#e6f7ff' : '#f0fff4');
    const size = data.size || 'medium'; // small, medium, large

    // Size presets
    const sizePresets = {
        small: {
            circle: { width: 60, height: 60, fontSize: '10px', padding: '5px' },
            box: { minWidth: 80, minHeight: 40, fontSize: '10px', padding: '10px' },
            handle: { width: 8, height: 8 },
        },
        medium: {
            circle: { width: 80, height: 80, fontSize: '12px', padding: '8px' },
            box: { minWidth: 100, minHeight: 50, fontSize: '12px', padding: '15px' },
            handle: { width: 10, height: 10 },
        },
        large: {
            circle: { width: 120, height: 120, fontSize: '14px', padding: '10px' },
            box: { minWidth: 150, minHeight: 80, fontSize: '14px', padding: '20px' },
            handle: { width: 12, height: 12 },
        }
    };

    const preset = sizePresets[size] || sizePresets.medium;

    // Style based on shape and size
    const shapeStyles = {
        circle: {
            borderRadius: '50%',
            width: preset.circle.width,
            height: preset.circle.height,
        },
        box: {
            borderRadius: '6px',
            minWidth: preset.box.minWidth,
            minHeight: preset.box.minHeight,
            padding: preset.box.padding,
        }
    };

    // Base node style
    const nodeStyle = {
        ...shapeStyles[shape],
        border: `2px solid ${color}`,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: selected
            ? `0 0 0 2px ${color}40`
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        fontSize: preset[shape].fontSize,
    };

    // Content style
    const contentStyle = {
        textAlign: 'center',
        fontWeight: shape === 'circle' ? '600' : 'bold',
        color: '#2d3748',
        lineHeight: '1.3',
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflow: 'hidden',
    };

    // Parse multi-line labels
    const renderLabel = () => {
        if (typeof label === 'string') {
            return label.split('\n').map((line, index) => (
                <div key={index} style={{ margin: '1px 0' }}>
                    {line}
                </div>
            ));
        }
        return label;
    };

    return (
        <div
            className="custom-node"
            style={nodeStyle}
            title={`ID: ${data.id}\nShape: ${shape}`}
        >
            {/* Debug indicator (tiny dot) */}
            {selected && (
                <div style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '1px solid white',
                    zIndex: 10,
                }} />
            )}

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: color,
                    width: preset.handle.width,
                    height: preset.handle.height,
                    border: '1px solid white',
                    opacity: 0.7,
                }}
            />

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: color,
                    width: preset.handle.width,
                    height: preset.handle.height,
                    border: '1px solid white',
                    opacity: 0.7,
                }}
            />

            {/* Main content */}
            <div style={contentStyle}>
                {renderLabel()}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: color,
                    width: preset.handle.width,
                    height: preset.handle.height,
                    border: '1px solid white',
                    opacity: 0.7,
                }}
            />

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: color,
                    width: preset.handle.width,
                    height: preset.handle.height,
                    border: '1px solid white',
                    opacity: 0.7,
                }}
            />
        </div>
    );
};

export default CustomNode;