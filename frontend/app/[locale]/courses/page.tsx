'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { CourseCard } from '@/components/ui/course-card-new';
import { SearchEmptyState } from '@/components/ui/search-empty-state';
import { SearchBar } from '@/components/home/search-bar';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { NoSearchResults } from '@/components/ui/no-search-results';
import { courseToCardProps } from '@/lib/course-adapter';
import { Course } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'react-hot-toast';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';


// Mock courses data - in a real app this would come from API
const mockCourses: Course[] = [
  {
    id: '1',
    slug: 'advanced-graphic-design',
    title: {
      ar: 'دورة التصميم الجرافيكي المتقدمة',
      en: 'Advanced Graphic Design Course'
    },
    summary: {
      ar: 'تعلم أساسيات وتقنيات التصميم الجرافيكي الحديث باستخدام أدوات احترافية',
      en: 'Learn fundamentals and modern graphic design techniques using professional tools'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'Live' as const,
    price: 1200,
    currency: 'SAR',
    rating: 4.8,

    isActive: true,
    isFeatured: true,
    badge: 'Bestseller' as const
  },
  {
    id: '2',
    slug: 'digital-marketing-fundamentals',
    title: {
      ar: 'أساسيات التسويق الرقمي',
      en: 'Digital Marketing Fundamentals'
    },
    summary: {
      ar: 'دورة شاملة في أساسيات التسويق الرقمي ووسائل التواصل الاجتماعي',
      en: 'Comprehensive course in digital marketing fundamentals and social media'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'PDF' as const,
    price: 899,
    currency: 'SAR',
    rating: 4.6,

    isActive: true,
    isFeatured: true,
    badge: 'Bestseller' as const
  },
  {
    id: '3',
    slug: 'project-management-professional',
    title: {
      ar: 'إدارة المشاريع الاحترافية',
      en: 'Professional Project Management'
    },
    summary: {
      ar: 'تعلم أحدث تقنيات وأساليب إدارة المشاريع الاحترافية',
      en: 'Learn the latest techniques and professional project management methods'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'Live' as const,
    price: 1599,
    currency: 'SAR',
    rating: 4.9,

    isActive: true,
    isFeatured: false,
    badge: 'Bestseller' as const
  },
  {
    id: '4',
    slug: 'data-analysis-excel',
    title: {
      ar: 'تحليل البيانات باستخدام Excel',
      en: 'Data Analysis with Excel'
    },
    summary: {
      ar: 'دورة متخصصة في تحليل البيانات والإحصاء باستخدام Microsoft Excel',
      en: 'Specialized course in data analysis and statistics using Microsoft Excel'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'PDF' as const,
    price: 699,
    currency: 'SAR',
    rating: 4.4,

    isActive: true,
    isFeatured: false,
    badge: 'Bestseller' as const
  },
  {
    id: '5',
    slug: 'leadership-skills',
    title: {
      ar: 'مهارات القيادة والإدارة',
      en: 'Leadership and Management Skills'
    },
    summary: {
      ar: 'تطوير مهارات القيادة الفعالة وإدارة الفرق في بيئة العمل',
      en: 'Develop effective leadership skills and team management in workplace'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'Live' as const,
    price: 1399,
    currency: 'SAR',
    rating: 4.7,

    isActive: true,
    isFeatured: true,
    badge: 'Bestseller' as const
  },
  {
    id: '6',
    slug: 'web-development-basics',
    title: {
      ar: 'أساسيات تطوير المواقع الإلكترونية',
      en: 'Web Development Basics'
    },
    summary: {
      ar: 'تعلم أساسيات تطوير المواقع الإلكترونية باستخدام HTML وCSS وJavaScript',
      en: 'Learn web development basics using HTML, CSS, and JavaScript'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    type: 'PDF' as const,
    price: 999,
    currency: 'SAR',
    rating: 4.5,

    isActive: true,
    isFeatured: false,
    badge: 'Bestseller' as const
  }
];

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { addItem, hasItem } = useCartStore();
  const { user } = useAuthStore();

  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';

  const [courses, setCourses] = useState(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [displayType, setDisplayType] = useState('grid');

  // Animation hooks
  const isLoaded = usePageLoad(100);
  const { visibleItems: featuredVisible, setRef: setFeaturedRef } = useStaggeredAnimation(
    courses.filter(course => course.isFeatured).slice(0, 2), 
    200
  );
  const { visibleItems: allCoursesVisible, setRef: setAllCoursesRef } = useStaggeredAnimation(
    filteredCourses, 
    100
  );

  // Filter and sort courses based on search query and filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(course => {
        const title = locale === 'ar' ? course.title.ar : course.title.en;
        const summary = locale === 'ar' ? course.summary.ar : course.summary.en;
        return title.toLowerCase().includes(searchTerm) || 
               summary.toLowerCase().includes(searchTerm);
      });
    }

    // Category filter
    if (category || categoryFilter) {
      const filterCategory = category || categoryFilter;
      // In a real app, you would filter by course.category
      // For now, we'll just keep all courses
    }

    // Sort courses
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          default:
            return 0;
        }
      });
    }

    setFilteredCourses(filtered);
  }, [query, category, categoryFilter, sortBy, courses, locale]);

  const handleToggleWishlist = (courseId: string) => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    // In a real app, you would call the wishlist API
    toast.success(t('wishlist.item-added'));
  };

  const handleAddToCart = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (hasItem(courseId)) {
      toast.success(t('cart.already-in-cart'));
      return;
    }

    addItem({
      id: `cart-${course.id}`,
      courseId: course.id,
      title: course.title,
      price: course.price,
      currency: course.currency,
      imageUrl: course.thumbnailUrl,
      instructor: 'مدرب محترف', // In real app, get from course data
      qty: 1
    });

    toast.success(t('cart.item-added'));
  };

  const handleCourseClick = (slug: string) => {
    router.push(`/${locale}/courses/${slug}`);
  };

  const hasSearchQuery = query.trim().length > 0;
  const hasResults = filteredCourses.length > 0;

  return (
    <>
      <ScrollAnimations />
      <div className={`relative min-h-screen pt-16 pb-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Background that extends to top */}
        <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Intro Section */}
          <div className={`mb-16 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {/* Tagline */}
            <div className={`mb-6 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <div className="inline-flex items-center text-brand text-sm font-semibold font-cairo">
                🔥 {t('consultation.badge')}
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className={`font-cairo font-bold leading-tight mb-4 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`} style={{
              color: 'var(--Primary, #292561)',
              textAlign: locale === 'ar' ? 'right' : 'left',
              fontFamily: 'Cairo',
              fontSize: '36px',
              fontStyle: 'normal',
              fontWeight: '700'
            }}>
              {t('consultation.title')}
            </h1>
            
            {/* Description */}
            <p className={`text-lg text-gray-600 leading-relaxed font-cairo ${locale === 'ar' ? 'text-right' : 'text-left'} ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {t('consultation.description')}
            </p>
          </div>

        {/* Featured Courses Section */}
        <div className="mb-16 scroll-item">          
          {/* Featured Courses Grid - 2 columns only */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {courses.filter(course => course.isFeatured).slice(0, 2).map((course, index) => {
              const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                inWishlist: false,
                inCart: hasItem(course.id),
                onToggleWishlist: handleToggleWishlist,
                onAddToCart: handleAddToCart,
                onClick: handleCourseClick
              });
              
              return (
                <div
                  key={course.id}
                  ref={setFeaturedRef(index)}
                  className={`scroll-item-scale hover-lift card-animate ${
                    featuredVisible.has(index) ? 'visible' : ''
                  }`}
                >
                  <CourseCard {...cardProps} />
                </div>
              );
            })}
          </div>
        </div>

        {/* All Courses Section */}
        <div className="mb-16">
          {/* Section Title */}
          <h2 className={`font-cairo font-bold leading-tight mb-8 scroll-item ${
            locale === 'ar' ? 'text-center' : 'text-center'
          }`} style={{
            color: 'var(--Primary, #292561)',
            textAlign: 'center',
            fontFamily: 'Cairo',
            fontSize: '36px',
            fontStyle: 'normal',
            fontWeight: '700'
          }}>
            {t('navigation.courses')}
          </h2>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className={`mb-6 scroll-item ${isLoaded ? 'animate-slide-in-right stagger-3' : 'opacity-0'}`}>
              <SearchBar />
            </div>

            {/* Filter Options - Match search width */}
            <div className={`w-full max-w-4xl mx-auto ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`} style={{ position: 'relative', zIndex: 99999 }}>
              <div className="flex gap-4 justify-end items-start">
                {/* Sort By */}
                <div className="flex-1">
                  <FilterDropdown
                    label={locale === 'ar' ? "الترتيب حسب" : "Sort By"}
                    options={[
                      { value: 'newest', label: locale === 'ar' ? 'الأحدث' : 'Newest' },
                      { value: 'oldest', label: locale === 'ar' ? 'الأقدم' : 'Oldest' },
                      { value: 'rating', label: locale === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' },
                      { value: 'price-low', label: locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
                      { value: 'price-high', label: locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' }
                    ]}
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder={locale === 'ar' ? "اختر الترتيب" : "Choose Order"}

                  />
                </div>

                {/* Category Filter */}
                <div className="flex-1">
                  <FilterDropdown
                    label={locale === 'ar' ? "التصنيف" : "Category"}
                    options={[
                      { value: 'tech', label: locale === 'ar' ? 'تقنية' : 'Technology' },
                      { value: 'management', label: locale === 'ar' ? 'إدارة' : 'Management' },
                      { value: 'marketing', label: locale === 'ar' ? 'تسويق' : 'Marketing' },
                      { value: 'design', label: locale === 'ar' ? 'تصميم' : 'Design' },
                      { value: 'finance', label: locale === 'ar' ? 'مالية' : 'Finance' }
                    ]}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    placeholder={locale === 'ar' ? "اختر التصنيف" : "Choose Category"}

                  />
                </div>

                {/* Display Type */}
                <div className="flex-1">
                  <FilterDropdown
                    label={locale === 'ar' ? "نوع العرض" : "Display Type"}
                    options={[
                      { value: 'grid', label: locale === 'ar' ? 'شبكة' : 'Grid' },
                      { value: 'list', label: locale === 'ar' ? 'قائمة' : 'List' }
                    ]}
                    value={displayType}
                    onChange={setDisplayType}
                    placeholder={locale === 'ar' ? "اختر العرض" : "Choose Display"}

                  />
                </div>
              </div>
            </div>
          </div>

          {/* All Courses Grid or No Results */}
          {filteredCourses.length === 0 && (query.trim() || sortBy || categoryFilter) ? (
            <div className="scroll-item">
              <NoSearchResults />
            </div>
          ) : (
            <div className={`grid gap-6 ${
              displayType === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`} style={{ position: 'relative', zIndex: 1 }}>
              {filteredCourses.map((course, index) => {
                const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                  inWishlist: false,
                  inCart: hasItem(course.id),
                  onToggleWishlist: handleToggleWishlist,
                  onAddToCart: handleAddToCart,
                  onClick: handleCourseClick
                });
                
                return (
                  <div
                    key={course.id}
                    ref={setAllCoursesRef(index)}
                    className={`scroll-item hover-lift card-animate ${
                      allCoursesVisible.has(index) ? 'visible' : ''
                    }`}
                  >
                    <CourseCard {...cardProps} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
