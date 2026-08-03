import React from 'react';
import { View, StyleSheet } from 'react-native';

const TINT = '#0E4C4C';

// Drawn from primitives rather than shipped as a bitmap so they stay sharp at
// any density. Every dimension derives from `size` to keep the cluster scalable.
const Battery = ({ size }) => (
  <View style={styles.row}>
    <View
      style={{
        width: size * 1.85,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: TINT,
      }}
    />
    <View
      style={{
        width: size * 0.14,
        height: size * 0.34,
        marginLeft: size * 0.1,
        borderTopRightRadius: size * 0.07,
        borderBottomRightRadius: size * 0.07,
        backgroundColor: TINT,
      }}
    />
  </View>
);

const Signal = ({ size }) => (
  <View style={[styles.row, { alignItems: 'flex-end' }]}>
    {[0.45, 0.72, 1].map((f, i) => (
      <View
        key={f}
        style={{
          width: size * 0.24,
          height: size * f,
          marginLeft: i === 0 ? 0 : size * 0.14,
          borderRadius: size * 0.1,
          backgroundColor: TINT,
        }}
      />
    ))}
  </View>
);

const Avatar = ({ size }) => (
  <View style={{ width: size, alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.44,
        height: size * 0.44,
        borderRadius: size * 0.22,
        backgroundColor: TINT,
      }}
    />
    <View
      style={{
        width: size * 0.82,
        height: size * 0.42,
        marginTop: size * 0.1,
        borderTopLeftRadius: size * 0.41,
        borderTopRightRadius: size * 0.41,
        backgroundColor: TINT,
      }}
    />
  </View>
);

const HeaderIcons = ({ size = 16, gap = 10 }) => (
  <View style={styles.row}>
    <Battery size={size} />
    <View style={{ width: gap }} />
    <Signal size={size} />
    <View style={{ width: gap }} />
    <Avatar size={size} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

export default HeaderIcons;
