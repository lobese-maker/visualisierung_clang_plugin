// PetriNetNode.jsx - DYNAMIC SIZING VERSION
import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';

const PetriNetNode = ({ data, selected }) => {
    const {
        type,           // 'place' or 'transition'
        label,
        tokens = [],
        firing = false
    } = data;

    const isPlace = type === 'place';
    const isTransition = type === 'transition';

    // Calculate dynamic dimensions based on content
    const { nodeWidth, nodeHeight, fontSize, padding } = useMemo(() => {
        const basePlaceSize = 80;
        const baseTransitionWidth = 100;
        const baseTransitionHeight = 50;

        // Calculate text width
        const getTextWidth = (text) => {
            // Approximate width based on character count
            const charCount = text?.length || 0;
            return Math.max(80, Math.min(200, charCount * 8 + 40));
        };

        // Calculate required height based on content
        const getTextHeight = (text, tokens) => {
            let lines = 1;

            // Count lines in label (if it has line breaks)
            if (text && text.includes('\n')) {
                lines += text.split('\n').length - 1;
            }

            // Add line for token display if needed
            if (tokens && tokens.length > 0 && tokens[0]) {
                lines += 1;
            }

            return Math.max(50, lines * 25);
        };

        if (isPlace) {
            const width = basePlaceSize;
            const height = basePlaceSize;
            const fontSize = Math.min(14, Math.max(10, 14 - (label.length - 8) * 0.5));

            return {
                nodeWidth: width,
                nodeHeight: height,
                fontSize,
                padding: 10
            };
        }

        if (isTransition) {
            const width = getTextWidth(label);
            const height = getTextHeight(label, tokens);
            const fontSize = Math.min(14, Math.max(10, 14 - (label.length - 10) * 0.3));

            return {
                nodeWidth: width,
                nodeHeight: height,
                fontSize,
                padding: 15
            };
        }

        return {
            nodeWidth: baseTransitionWidth,
            nodeHeight: baseTransitionHeight,
            fontSize: 14,
            padding: 10
        };
    }, [label, tokens, isPlace, isTransition]);

    // Get colors
    const getColors = () => {
        if (isPlace) {
            const tokenCount = tokens.length;
            return {
                border: tokenCount > 0 ? '#2b6cb0' : '#90cdf4',
                bg: tokenCount > 0 ? '#ebf8ff' : '#f7fafc',
                token: '#2b6cb0',
                text: '#2d3748',
            };
        }

        if (isTransition) {
            if (firing) {
                return {
                    border: '#f56565',
                    bg: '#fff5f5',
                    text: '#c53030',
                    accent: '#fc8181',
                };
            }
            return {
                border: '#38a169',
                bg: '#f0fff4',
                text: '#22543d',
                accent: '#68d391',
            };
        }

        return {
            border: '#a0aec0',
            bg: '#f7fafc',
            text: '#4a5568',
        };
    };

    const colors = getColors();
    const tokenCount = tokens.length;

    // Node style with dynamic dimensions
    const nodeStyle = {
        borderRadius: isPlace ? '50%' : '8px',
        width: nodeWidth,
        height: nodeHeight,
        minWidth: isPlace ? 80 : 100,
        minHeight: isPlace ? 80 : 50,
        border: `3px solid ${colors.border}`,
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontSize: fontSize,
        fontWeight: 'bold',
        color: colors.text,
        boxShadow: selected ? `0 0 0 3px ${colors.border}40` : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        padding: padding,
        wordBreak: 'break-word',
        textAlign: 'center',
        lineHeight: '1.3',
    };

    // Parse label into lines
    const labelLines = useMemo(() => {
        if (!label) return [''];
        return label.split('\n').map(line => line.trim());
    }, [label]);

    // Get first token for display
    const firstToken = tokens && tokens.length > 0 ? tokens[0] : null;

    // Firing effect for transitions
    const renderFiringEffect = () => {
        if (!isTransition || !firing) return null;

        return (
            <>
                {/* Inner glow effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at center, 
                        rgba(245, 101, 101, 0.3) 0%, 
                        rgba(245, 101, 101, 0.1) 50%, 
                        transparent 100%)`,
                    animation: 'pulse 1.5s infinite',
                    pointerEvents: 'none',
                }} />

                {/* Fire indicator badge */}
                <div style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#f56565',
                    color: 'white',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(245, 101, 101, 0.5)',
                    animation: 'pulse 1s infinite',
                    zIndex: 10,
                }}>
                    ⚡
                </div>
            </>
        );
    };

    // Token visualization for places
    const renderTokens = () => {
        if (!isPlace) return null;

        // Show token count badge
        return (
            <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: tokenCount > 0 ? colors.token : '#a0aec0',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 5,
            }}>
                {tokenCount}
            </div>
        );
    };

    // Token dots inside the circle (visual representation)
    const renderTokenDots = () => {
        if (!isPlace || tokenCount === 0) return null;

        // For 1 token
        if (tokenCount === 1) {
            return (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: colors.token,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
            );
        }

        return null;
    };

    // Status indicator for empty places
    const renderStatusIndicator = () => {
        if (!isPlace || tokenCount > 0) return null;

        return (
            <div style={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '9px',
                color: '#a0aec0',
                whiteSpace: 'nowrap',
                background: 'rgba(255,255,255,0.9)',
                padding: '1px 6px',
                borderRadius: '3px',
                border: '1px solid #e2e8f0',
            }}>
                empty
            </div>
        );
    };

    return (
        <div style={nodeStyle}>
            {/* Node label with multiple lines */}
            <div style={{
                zIndex: 2,
                position: 'relative',
                width: '100%',
            }}>
                {labelLines.map((line, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: index < labelLines.length - 1 ? '2px' : '0',
                        }}
                    >
                        {line}
                    </div>
                ))}

                {/* Show first token name for places with tokens */}
                {isPlace && firstToken && (
                    <div style={{
                        fontSize: Math.max(9, fontSize - 3),
                        color: '#4a5568',
                        marginTop: '4px',
                        opacity: 0.8,
                        fontWeight: 'normal',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '0 5px',
                    }}>
                        {firstToken}
                    </div>
                )}

                {/* Show token info for transitions if needed */}
                {isTransition && tokenCount > 0 && (
                    <div style={{
                        fontSize: Math.max(10, fontSize - 2),
                        color: colors.text,
                        marginTop: '4px',
                        opacity: 0.7,
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                    }}>
                        {tokenCount} token{tokenCount !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Token dots (visual representation) */}
            {renderTokenDots()}

            {/* Token count badge */}
            {renderTokens()}

            {/* Firing effect for transitions */}
            {renderFiringEffect()}

            {/* Status indicator for empty places */}
            {renderStatusIndicator()}

            {/* Handles - positioned based on node size */}
            {isPlace ? (
                <>
                    <Handle
                        type="target"
                        position={Position.Left}
                        style={{
                            background: colors.border,
                            width: 10,
                            height: 10,
                            border: '2px solid white',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        style={{
                            background: colors.border,
                            width: 10,
                            height: 10,
                            border: '2px solid white',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </>
            ) : (
                <>
                    <Handle
                        type="target"
                        position={Position.Top}
                        style={{
                            background: colors.border,
                            width: 10,
                            height: 10,
                            border: '2px solid white',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    />
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        style={{
                            background: colors.border,
                            width: 10,
                            height: 10,
                            border: '2px solid white',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default PetriNetNode;