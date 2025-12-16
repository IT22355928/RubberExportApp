import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Button,
  Searchbar,
  Chip,
  Provider,
  Menu,
} from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Mock data for test reports
const TEST_REPORTS_DATA = [
  {
    id: "TR-2024-001",
    batchId: "BATCH-2024-1101",
    category: "RSS Rubber",
    date: "2024-11-15",
    time: "14:30",
    tester: "John Doe",
    status: "completed",
    qualityScore: 94,
    sheetCount: 50,
    weight: 350,
    defects: "No major defects",
  },
  {
    id: "TR-2024-002",
    batchId: "BATCH-2024-1102",
    category: "RSS Rubber",
    date: "2024-11-14",
    time: "10:15",
    tester: "Jane Smith",
    status: "completed",
    qualityScore: 88,
    sheetCount: 45,
    weight: 320,
    defects: "No major defects",
  },
  {
    id: "TR-2024-003",
    batchId: "BATCH-2024-1103",
    category: "RSS Rubber",
    date: "2024-11-13",
    time: "16:45",
    tester: "Mike Johnson",
    status: "pending",
    qualityScore: null,
    sheetCount: 60,
    weight: 400,
    defects: "Under testing",
  },
  {
    id: "TR-2024-004",
    batchId: "BATCH-2024-1104",
    category: "RSS Rubber",
    date: "2024-11-12",
    time: "09:20",
    tester: "Sarah Wilson",
    status: "completed",
    qualityScore: 96,
    sheetCount: 55,
    weight: 380,
    defects: "No major defects",
  },
  {
    id: "TR-2024-005",
    batchId: "BATCH-2024-1105",
    category: "RSS Rubber",
    date: "2024-11-11",
    time: "13:10",
    tester: "David Brown",
    status: "failed",
    qualityScore: 52,
    sheetCount: 40,
    weight: 280,
    defects: "Tar spots",
  },
  {
    id: "TR-2024-006",
    batchId: "BATCH-2024-1106",
    category: "RSS Rubber",
    date: "2024-11-10",
    time: "11:25",
    tester: "Emily Chen",
    status: "completed",
    qualityScore: 91,
    sheetCount: 52,
    weight: 365,
    defects: "No major defects",
  },
  {
    id: "TR-2024-007",
    batchId: "BATCH-2024-1107",
    category: "RSS Rubber",
    date: "2024-11-09",
    time: "15:40",
    tester: "Robert Garcia",
    status: "failed",
    qualityScore: 65,
    sheetCount: 38,
    weight: 265,
    defects: "Dirt",
  },
  {
    id: "TR-2024-008",
    batchId: "BATCH-2024-1108",
    category: "RSS Rubber",
    date: "2024-11-08",
    time: "08:15",
    tester: "Lisa Wang",
    status: "pending",
    qualityScore: null,
    sheetCount: 58,
    weight: 390,
    defects: "Under testing",
  },
  {
    id: "TR-2024-009",
    batchId: "BATCH-2024-1109",
    category: "RSS Rubber",
    date: "2024-11-07",
    time: "13:55",
    tester: "James Wilson",
    status: "completed",
    qualityScore: 89,
    sheetCount: 48,
    weight: 335,
    defects: "No major defects",
  },
  {
    id: "TR-2024-010",
    batchId: "BATCH-2024-1110",
    category: "RSS Rubber",
    date: "2024-11-06",
    time: "16:20",
    tester: "Maria Rodriguez",
    status: "failed",
    qualityScore: 58,
    sheetCount: 35,
    weight: 245,
    defects: "Pin head bubbles",
  },
];

const STATUS_CONFIG = {
  completed: {
    color: "#10B981",
    label: "Completed",
    icon: "check-circle",
    headerColor: ["#10B981", "#059669"],
  },
  pending: {
    color: "#3B82F6",
    label: "Pending",
    icon: "clock",
    headerColor: ["#3B82F6", "#1D4ED8"],
  },
  failed: {
    color: "#EF4444",
    label: "Failed",
    icon: "alert-circle",
    headerColor: ["#EF4444", "#DC2626"],
  },
};

const QUALITY_GRADIENTS = {
  primary: ["#667eea", "#764ba2"],
  success: ["#4facfe", "#00f2fe"],
  warning: ["#f093fb", "#f5576c"],
  excellent: ["#10B981", "#059669"],
  good: ["#3B82F6", "#1D4ED8"],
  average: ["#F59E0B", "#D97706"],
  poor: ["#EF4444", "#DC2626"],
};

interface Report {
  id: string;
  batchId: string;
  category: string;
  date: string;
  time: string;
  tester: string;
  status: string;
  qualityScore: number | null;
  sheetCount: number;
  weight: number;
  defects: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  colors: string[];
}

interface ReportCardProps {
  report: Report;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  colors,
}) => (
  <LinearGradient colors={colors as any} style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </LinearGradient>
);

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.pending
    );
  };

  const getQualityGradient = (score: number | null) => {
    if (score === null) return QUALITY_GRADIENTS.warning;
    if (score >= 90) return QUALITY_GRADIENTS.excellent;
    if (score >= 80) return QUALITY_GRADIENTS.good;
    if (score >= 70) return QUALITY_GRADIENTS.average;
    return QUALITY_GRADIENTS.poor;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportReport = (report: Report) => {
    Alert.alert(
      "Export Successful",
      `Report ${report.batchId} has been exported as PDF with an attractive template!\n\nIncludes:\n• Company Header\n• Quality Assessment Details\n• Defects Analysis\n• Technical Parameters\n• Digital Signature`,
      [{ text: "OK" }]
    );
  };

  const viewDetails = (report: Report) => {
    const statusConfig = getStatusConfig(report.status);
    const qualityGradient = getQualityGradient(report.qualityScore);

    Alert.alert(
      "📊 Quality Test Report Details",
      `\n` +
        `🎯 **Batch Information**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 Batch ID: ${report.batchId}\n` +
        `📋 Category: ${report.category}\n` +
        `📅 Test Date: ${formatDate(report.date)}\n` +
        `⏰ Time: ${report.time}\n` +
        `👤 Tester: ${report.tester}\n\n` +
        `📈 **Quality Assessment**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 Quality Score: ${
          report.qualityScore ? `${report.qualityScore}/100` : "Pending"
        }\n` +
        `📊 Status: ${statusConfig.label}\n` +
        `📦 Sheet Count: ${report.sheetCount}\n` +
        `⚖️ Weight: ${report.weight} kg\n\n` +
        `⚠️ **Defects Analysis**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔍 ${report.defects}\n\n` +
        `📋 **Quality Rating**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${
          report.qualityScore
            ? report.qualityScore >= 90
              ? "🏆 Excellent Quality - RSS1 Grade"
              : report.qualityScore >= 80
              ? "✅ Good Quality - RSS2 Grade"
              : report.qualityScore >= 70
              ? "⚠️ Average Quality - RSS3 Grade"
              : "❌ Low Quality - RSS4 Grade"
            : "⏳ Quality Assessment Pending"
        }`,

      [
        {
          text: "📤 Export PDF",
          onPress: () => exportReport(report),
          style: "default",
        },
        {
          text: "✉️ Share",
          onPress: () => shareReport(report),
          style: "default",
        },
        {
          text: "✅ Close",
          style: "cancel",
        },
      ]
    );
  };

  const shareReport = (report: Report) => {
    Alert.alert(
      "Share Report",
      `Sharing quality report for ${report.batchId}...\n\nThis would typically open your device's share dialog to send via email, messaging, or other apps.`,
      [{ text: "OK" }]
    );
  };

  const statusConfig = getStatusConfig(report.status);

  return (
    <Card style={styles.reportCard}>
      <LinearGradient
        colors={statusConfig.headerColor as any}
        style={styles.reportHeader}
      >
        <View style={styles.reportHeaderContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.batchId}>{report.batchId}</Text>
            <Text style={styles.reportCategory}>{report.category}</Text>
          </View>
          <View style={styles.qualityBadge}>
            <MaterialCommunityIcons
              name={statusConfig.icon as any}
              size={20}
              color="#FFFFFF"
            />
          </View>
        </View>
      </LinearGradient>

      <Card.Content style={styles.reportContent}>
        <View style={styles.reportMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#64748B" />
            <Text style={styles.metaText}>{formatDate(report.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.metaText}>{report.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account" size={16} color="#64748B" />
            <Text style={styles.metaText}>{report.tester}</Text>
          </View>
        </View>

        <View style={styles.statusQualityContainer}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusConfig.color },
              ]}
            />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
          {report.qualityScore && (
            <View style={styles.qualityContainer}>
              <LinearGradient
                colors={getQualityGradient(report.qualityScore) as any}
                style={styles.qualityScore}
              >
                <Text style={styles.qualityScoreText}>
                  {report.qualityScore}
                </Text>
              </LinearGradient>
              <Text style={styles.qualityLabel}>Score</Text>
            </View>
          )}
        </View>

        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="layers" size={14} color="#64748B" />
            <Text style={styles.infoText}>{report.sheetCount} sheets</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="scale" size={14} color="#64748B" />
            <Text style={styles.infoText}>{report.weight} kg</Text>
          </View>
        </View>

        <View style={styles.defectsContainer}>
          <View style={styles.defectsHeader}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={14}
              color="#64748B"
            />
            <Text style={styles.defectsTitle}>Defects Type</Text>
          </View>
          <Text style={styles.defectsText} numberOfLines={2}>
            {report.defects}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => viewDetails(report)}
            style={styles.viewButton}
            labelStyle={styles.viewButtonLabel}
            icon="eye-outline"
          >
            View
          </Button>
          <Button
            mode="contained"
            onPress={() => exportReport(report)}
            style={styles.exportButton}
            labelStyle={styles.exportButtonLabel}
            icon="file-export-outline"
          >
            Export
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function TestReportsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, slideAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 100);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const filteredReports = TEST_REPORTS_DATA.filter((report: Report) => {
    const matchesSearch =
      report.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tester.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" || report.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a: Report, b: Report) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "score":
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons
            name="file-document-multiple-outline"
            size={64}
            color="#4F46E5"
          />
          <Text style={styles.loadingTitle}>Loading Test Reports</Text>
          <Text style={styles.loadingSubtitle}>
            Preparing quality assessment history...
          </Text>
          <ActivityIndicator
            size="large"
            color="#4F46E5"
            style={styles.loadingSpinner}
          />
          <Text style={styles.loadingText}>Please wait a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        <LinearGradient
          colors={QUALITY_GRADIENTS.primary as any}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerPlaceholder} />
          </View>

          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.headerMain}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={["#ffffff", "#f0f4ff"]}
                  style={styles.mainIconContainer}
                >
                  <MaterialCommunityIcons
                    name="file-document-multiple-outline"
                    size={32}
                    color="#667eea"
                  />
                </LinearGradient>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.title}>Test Reports</Text>
                <Text style={styles.subtitle}>Quality Assessment History</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.statsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <StatsCard
              title="Total Reports"
              value={TEST_REPORTS_DATA.length}
              subtitle="This month"
              colors={["#4F46E5", "#7C3AED"]}
            />
            <StatsCard
              title="Passed Tests"
              value={
                TEST_REPORTS_DATA.filter((r) => r.status === "completed").length
              }
              subtitle="Tests done"
              colors={["#10B981", "#059669"]}
            />
            <StatsCard
              title="Avg Score"
              value="89%"
              subtitle="Quality average"
              colors={["#0EA5E9", "#0369A1"]}
            />
          </Animated.View>

          <View style={styles.controlsContainer}>
            <Searchbar
              placeholder="Search reports..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              theme={{
                roundness: 12,
                colors: {
                  primary: "#4F46E5",
                  outline: "#4F46E5",
                },
              }}
            />

            <View style={styles.filtersRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsContainer}
              >
                <Chip
                  selected={selectedStatus === "all"}
                  onPress={() => setSelectedStatus("all")}
                  style={styles.chip}
                  mode="outlined"
                >
                  All Status
                </Chip>
                <Chip
                  selected={selectedStatus === "completed"}
                  onPress={() => setSelectedStatus("completed")}
                  style={styles.chip}
                  mode="outlined"
                >
                  Completed
                </Chip>
                <Chip
                  selected={selectedStatus === "pending"}
                  onPress={() => setSelectedStatus("pending")}
                  style={styles.chip}
                  mode="outlined"
                >
                  Pending
                </Chip>
                <Chip
                  selected={selectedStatus === "failed"}
                  onPress={() => setSelectedStatus("failed")}
                  style={styles.chip}
                  mode="outlined"
                >
                  Failed
                </Chip>
              </ScrollView>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.sortButton}
                    icon="sort"
                  >
                    Sort
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSortBy("newest");
                    setMenuVisible(false);
                  }}
                  title="Newest First"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("oldest");
                    setMenuVisible(false);
                  }}
                  title="Oldest First"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("score");
                    setMenuVisible(false);
                  }}
                  title="Highest Score"
                />
              </Menu>
            </View>
          </View>

          <View style={styles.reportsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Test Reports ({filteredReports.length})
              </Text>
              <View style={styles.viewModeToggle}>
                <TouchableOpacity
                  onPress={() => setViewMode("grid")}
                  style={[
                    styles.viewModeButton,
                    viewMode === "grid" && styles.viewModeActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="view-grid"
                    size={20}
                    color={viewMode === "grid" ? "#4F46E5" : "#64748B"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode("list")}
                  style={[
                    styles.viewModeButton,
                    viewMode === "list" && styles.viewModeActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="view-list"
                    size={20}
                    color={viewMode === "list" ? "#4F46E5" : "#64748B"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {filteredReports.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={64}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyStateTitle}>No reports found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              <View
                style={
                  viewMode === "grid" ? styles.reportsGrid : styles.reportsList
                }
              >
                {filteredReports.map((report, index) => (
                  <Animated.View
                    key={report.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <ReportCard report={report} />
                  </Animated.View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F46E5",
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerContent: {
    position: "relative",
    zIndex: 2,
  },
  headerMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrapper: {
    marginRight: 16,
  },
  mainIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginLeft:15,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
    marginTop: 2,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4F46E5",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipsContainer: {
    flex: 1,
    marginRight: 12,
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  sortButton: {
    borderRadius: 12,
  },
  reportsContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewModeActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reportsList: {
    // Single column layout
  },
  reportCard: {
    width: width - 32,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  reportHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  reportHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  batchId: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  reportCategory: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "600",
  },
  qualityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  reportContent: {
    padding: 20,
  },
  reportMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statusQualityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  qualityContainer: {
    alignItems: "center",
  },
  qualityScore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  qualityScoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  qualityLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  defectsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  defectsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  defectsTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  defectsText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  viewButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: "#4F46E5",
    borderWidth: 2,
  },
  viewButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  exportButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
  },
  exportButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});
