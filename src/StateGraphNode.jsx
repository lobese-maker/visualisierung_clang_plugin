// StateGraphNode.jsx - DYNAMIC SIZING
import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';

const StateGraphNode = ({ data }) => {
    const {
        stateId,
        marking = {},
        firedTransitions = [],
        isCurrent = false
    } = data;

    // Calculate dynamic dimensions
    const { nodeWidth, nodeHeight } = useMemo(() => {
        const placeCount = Object.keys(marking).length;
        const transitionCount = firedTransitions.length;

        // Base dimensions
        let width = 180;
        let height = 120;

        // Adjust based on content
        if (placeCount > 6) {
            height += (placeCount - 6) * 15;
        }

        if (transitionCount > 3) {
            height += (transitionCount - 3) * 15;
        }

        // Ensure minimum dimensions
        return {
            nodeWidth: Math.max(180, width),
            nodeHeight: Math.max(120, height),
        };
    }, [marking, firedTransitions]);

    const nodeStyle = {
        background: isCurrent ? '#fef3c7' : '#f7fafc',
        border: `2px solid ${isCurrent ? '#f59e0b' : '#cbd5e0'}`,
        borderRadius: '6px',
        padding: '12px',
        width: nodeWidth,
        minWidth: '180px',
        minHeight: '120px',
        fontSize: '11px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
    };

    // Count total tokens
    const totalTokens = useMemo(() => {
        return Object.values(marking).reduce((sum, tokens) => sum + (tokens?.length || 0), 0);
    }, [marking]);

    return (
        <div style={nodeStyle}>
            {/* State header */}
            <div style={{
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '8px',
                paddingBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <strong style={{ color: '#2d3748', fontSize: '12px' }}>
                    State {stateId}
                </strong>
                {isCurrent && (
                    <span style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '1px 8px',
                        borderRadius: '10px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                    }}>
                        CURRENT
                    </span>
                )}
            </div>

            {/* Markings section - scrollable if too many */}
            <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: '10px',
                paddingRight: '5px',
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }}>
                    Tokens ({totalTokens}):
                </div>
                {Object.entries(marking).map(([place, tokens]) => (
                    <div
                        key={place}
                        style={{
                            marginBottom: '3px',
                            padding: '3px',
                            background: tokens?.length > 0 ? '#e6fffa' : '#edf2f7',
                            borderRadius: '3px',
                            fontSize: '10px',
                        }}
                    >
                        <span style={{ fontWeight: '600' }}>{place}:</span>
                        <span style={{
                            marginLeft: '5px',
                            color: tokens?.length > 0 ? '#22543d' : '#718096',
                            wordBreak: 'break-word',
                        }}>
                            {tokens?.length > 0 ? tokens.join(', ') : 'empty'}
                        </span>
                        {tokens?.length > 0 && (
                            <span style={{
                                background: '#38a169',
                                color: 'white',
                                padding: '0 6px',
                                borderRadius: '10px',
                                fontSize: '9px',
                                marginLeft: '8px',
                                float: 'right',
                            }}>
                                {tokens.length}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Fired transitions */}
            <div style={{
                borderTop: '1px dashed #e2e8f0',
                paddingTop: '8px',
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }}>
                    Fired Transitions:
                </div>
                {firedTransitions.length === 0 ? (
                    <div style={{
                        color: '#a0aec0',
                        fontStyle: 'italic',
                        fontSize: '10px',
                        textAlign: 'center',
                        padding: '5px',
                    }}>
                        No transitions fired yet
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {firedTransitions.map((ft, index) => (
                            <div
                                key={index}
                                style={{
                                    background: '#bee3f8',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {ft.transition}: {ft.count}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: '#718096',
                    width: 8,
                    height: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: '#718096',
                    width: 8,
                    height: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
        </div>
    );
};

export default StateGraphNode;