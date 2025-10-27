import React, { forwardRef, RefObject, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList as RNFlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";

const styles = StyleSheet.create({
  indicatorContainer: {
    paddingVertical: 6,
    alignItems: "center",
    width: "100%",
  },
});

export type BidirectionalFlatListProps<T> = Omit<
  FlatListProps<T>,
  "onEndReached"
> & {
  onStartReached: () => Promise<void>;
  onEndReached: () => Promise<void>;
  onStartReachedThreshold?: number;
  onEndReachedThreshold?: number;
  showDefaultLoadingIndicators?: boolean;
};

function BidirectionalFlatListInner<T>(
  props: BidirectionalFlatListProps<T>,
  ref:
    | RefObject<RNFlatList<T> | null>
    | ((instance: RNFlatList<T> | null) => void)
    | null,
) {
  const {
    data,
    onScroll,
    onStartReached,
    onEndReached,
    onStartReachedThreshold = 80,
    onEndReachedThreshold = 80,
    showDefaultLoadingIndicators = true,
    ...rest
  } = props;

  const safeData = data ?? [];
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);

  const triggeredTop = useRef<Record<number, boolean>>({});
  const triggeredBottom = useRef<Record<number, boolean>>({});

  const maybeStart = () => {
    if (triggeredTop.current[safeData.length]) return;
    triggeredTop.current[safeData.length] = true;
    setLoadingTop(true);

    onStartReached().finally(() => setLoadingTop(false));
  };

  const maybeEnd = () => {
    if (triggeredBottom.current[safeData.length]) return;
    triggeredBottom.current[safeData.length] = true;
    setLoadingBottom(true);

    onEndReached().finally(() => setLoadingBottom(false));
  };

  const handleScroll: ScrollViewProps["onScroll"] = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    onScroll?.(e);

    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;

    if (contentOffset.y <= onStartReachedThreshold) maybeStart();
    if (
      contentSize.height - layoutMeasurement.height - contentOffset.y <=
      onEndReachedThreshold
    )
      maybeEnd();
  };

  return (
    <RNFlatList
      {...rest}
      ref={ref}
      data={safeData}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      ListHeaderComponent={
        showDefaultLoadingIndicators && loadingTop ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : undefined
      }
      ListFooterComponent={
        showDefaultLoadingIndicators && loadingBottom ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : undefined
      }
    />
  );
}

export const BidirectionalFlatList = forwardRef(BidirectionalFlatListInner);
